/**
 * CreditAssist AI - Main Backend Server
 * Production-grade Express server with AI integration
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ============ IN-MEMORY ESCALATION STORE ============
// Store escalated cases from chat conversations
const escalatedConversations = new Map();

// Live counters (reset on server restart)
const liveStats = {
  auto_resolved: 0,
  escalated: 0,
  awaiting_context: 0,
  by_sentiment: { positive: 0, neutral: 0, negative: 0, frustrated: 0, angry: 0, urgent: 0 },
  by_reason: {},
  resolution_times_ms: []
};
const conversationStartTimes = new Map();
// AI-resolved conversations the member explicitly closed via "Issue Resolved"
const aiResolvedConversations = new Map();

// ============ MIDDLEWARE SETUP ============
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const localOrigins = [
  'http://localhost:3000', 'http://localhost:3001',
  'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'
];
const fixedOrigins = [...localOrigins, ...allowedOrigins, process.env.FRONTEND_URL, process.env.DASHBOARD_URL].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser tools (curl, server-to-server) and any whitelisted origin.
    if (!origin) return cb(null, true);
    if (fixedOrigins.includes(origin)) return cb(null, true);
    // Allow any *.vercel.app preview/production deploy by default
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database is fully optional. Only attempt a connection if DATABASE_URL is set.
let pool = null;
let dbConnected = false;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', () => {});
    pool.query('SELECT 1', (err) => {
      if (err) {
        console.log('⚠️  Database unreachable — running in mock data mode');
      } else {
        console.log('✓ Database connected');
        dbConnected = true;
      }
    });
  } catch {
    console.log('⚠️  Database init failed — running in mock data mode');
  }
} else {
  console.log('ℹ️  No DATABASE_URL — running in mock data mode (expected for free deploy)');
}

// ============ AUTHENTICATION MIDDLEWARE ============
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Staff endpoints: accept JWT OR the demo staff token (no real staff login yet)
const staffAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = { role: 'staff', demo: true };
    return next();
  }
  if (token === 'demo-token' || token === 'staff-demo') {
    req.user = { role: 'staff', demo: true };
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    req.user = user || { role: 'staff', demo: true };
    next();
  });
};

// ============ HEALTH CHECK ENDPOINT ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ RAG STATUS ============
app.get('/api/rag/status', (req, res) => {
  try {
    const { RAGEngine } = require('./services/ragEngine');
    const rag = new RAGEngine();
    const bySource = {};
    rag.documents.forEach(d => { bySource[d.filename] = (bySource[d.filename] || 0) + 1; });
    res.json({
      status: 'ok',
      total_chunks: rag.documents.length,
      total_documents: Object.keys(bySource).length,
      by_document: bySource
    });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// ============ AUTHENTICATION ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // In production: hash password with bcrypt
    const query = `
      INSERT INTO users (email, name, password_hash, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, email, name
    `;
    
    const result = await pool.query(query, [email, name, password]);
    const user = result.rows[0];
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Load test users
    const testUsers = require('./data/testUsers');
    
    // Find user by email
    const user = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Verify password (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'creditassist-local-dev-key-super-secret-change-in-prod',
      { expiresIn: '24h' }
    );
    
    // Return user profile with account data
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profile: user.profile,
        accounts: user.accounts,
        cards: user.cards,
        loans: user.loans,
        recentTransactions: user.recentTransactions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ CHAT ROUTES ============
app.post('/api/chat/message', authenticateToken, async (req, res) => {
  try {
    const { message, conversation_id, language } = req.body;
    const user_id = req.user.id;
    
    // Load test users to get user profile
    const testUsers = require('./data/testUsers');
    const userProfile = testUsers.find(u => u.id === user_id);
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Import AI service (LLM-powered with conversation memory)
    const { getAIService } = require('./services/aiService');
    const aiService = getAIService();
    
    // Get AI response with user context (uses Ollama LLM with conversation context + user profile)
    const aiResponse = await aiService.processMessage(message, conversation_id, user_id, {
      userProfile: userProfile,
      userContext: {
        name: userProfile.name,
        email: userProfile.email,
        accountStatus: userProfile.profile.accountStatus,
        riskScore: userProfile.profile.riskScore,
        totalBalance: userProfile.accounts.reduce((sum, acc) => sum + acc.balance, 0),
        accounts: userProfile.accounts,
        cards: userProfile.cards,
        loans: userProfile.loans,
        recentTransactions: userProfile.recentTransactions
      }
    });
    
    // Mock response format for compatibility
    const now = new Date();
    const mockAiMessage = {
      id: 'msg-' + Date.now(),
      content: aiResponse.content,
      sender: 'ai',
      created_at: now.toISOString(),
      metadata: {
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        sentiment: aiResponse.sentiment,
        resolution_status: aiResponse.resolution_status,
        decision_type: aiResponse.metadata.decision_type,
        llm_model: aiResponse.llmModel,
        conversation_memory: aiResponse.metadata.conversation_memory,
        escalation_reason: aiResponse.metadata.escalation_reason,
        escalated: aiResponse.metadata.escalated,
        policy_action: aiResponse.metadata.policy_action,
        awaiting_context: aiResponse.metadata.awaiting_context
      }
    };
    
    // Track stats
    if (!conversationStartTimes.has(conversation_id)) {
      conversationStartTimes.set(conversation_id, Date.now());
    }
    if (aiResponse.sentiment && liveStats.by_sentiment[aiResponse.sentiment] !== undefined) {
      liveStats.by_sentiment[aiResponse.sentiment] += 1;
    }
    if (aiResponse.metadata.awaiting_context) {
      liveStats.awaiting_context += 1;
    } else if (aiResponse.metadata.escalated === true) {
      liveStats.escalated += 1;
      const reason = aiResponse.metadata.escalation_reason || 'unknown';
      liveStats.by_reason[reason] = (liveStats.by_reason[reason] || 0) + 1;
    } else {
      liveStats.auto_resolved += 1;
      const started = conversationStartTimes.get(conversation_id);
      if (started) liveStats.resolution_times_ms.push(Date.now() - started);
    }

    // STORE ESCALATION IF TRIGGERED
    if (aiResponse.metadata.escalated === true) {
      const conversationKey = `${user_id}:${conversation_id}`;

      // Build a clean conversation summary from memory
      const memory = aiResponse.metadata.conversation_memory || {};
      const messages = memory.messages || [];
      const transcript = messages
        .map(m => `${m.role === 'user' ? userProfile.name : 'AI'}: ${m.content.replace(/<decision>.*<\/decision>/gs, '').trim()}`)
        .join('\n');
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
      const issueType = (userMessages[0] || message).split('\n')[0].substring(0, 80);

      const reasonLabels = {
        FRAUD_SUSPECTED: 'Suspected Fraud',
        TRANSACTION_DISPUTE: 'Transaction Dispute',
        LEGAL_THREAT: 'Legal Threat',
        DELINQUENCY_HARDSHIP: 'Payment Hardship',
        ACCOUNT_LOCK_RESTRICTION: 'Account Restricted',
        OUT_OF_SCOPE_REQUEST: 'Out of AI Scope',
        EXPLICIT_HUMAN_REQUEST: 'Requested Human Agent',
        PERSISTENT_DISSATISFACTION: 'Unresolved After Attempts',
        GENUINE_ANGER_OR_DISTRESS: 'High Emotional State'
      };
      const reasonCode = aiResponse.metadata.escalation_reason;

      const escalationCase = {
        id: `case-${conversation_id}`,
        conversation_id,
        user_id,
        user_email: userProfile.email,
        user_name: userProfile.name,
        issue_type: reasonLabels[reasonCode] || issueType,
        status: 'escalated',
        priority: aiResponse.sentiment === 'urgent' || reasonCode === 'FRAUD_SUSPECTED' || reasonCode === 'LEGAL_THREAT' ? 'critical' : 'high',
        sentiment: aiResponse.sentiment,
        created_at: (escalatedConversations.get(conversationKey)?.created_at) || now.toISOString(),
        updated_at: now.toISOString(),
        escalated: true,
        escalation_reason: reasonCode,
        escalation_reason_label: reasonLabels[reasonCode] || reasonCode,
        message_count: messages.length,
        conversation_transcript: transcript,
        ai_summary: aiResponse.content.replace(/🚨[^\n]*\n\n---\n\n/g, '').trim(),
        first_user_message: userMessages[0] || message,
        last_message: message,
        last_ai_response: aiResponse.content
      };

      escalatedConversations.set(conversationKey, escalationCase);
      console.log(`🚨 ESCALATION: ${userProfile.name} → ${reasonCode} (${messages.length} msgs)`);
    }
    
    res.json({
      user_message: {
        id: 'msg-' + (Date.now() - 1),
        content: message,
        sender: 'user',
        created_at: new Date(Date.now() - 1000).toISOString()
      },
      ai_response: mockAiMessage
    });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

// Member marks conversation resolved from the chat.
// Behavior:
//  - If the conversation was escalated, leave the escalation in place
//    on the dashboard (a human still needs to follow up).
//  - Otherwise, record this as an AI-resolved case with the full
//    conversation transcript so staff can see what happened.
app.post('/api/chat/resolve', authenticateToken, (req, res) => {
  try {
    const { conversation_id } = req.body;
    const user_id = req.user.id;
    const conversationKey = `${user_id}:${conversation_id}`;
    const wasEscalated = escalatedConversations.has(conversationKey);

    if (!wasEscalated) {
      // Pull the AI service to grab conversation memory
      const { getAIService } = require('./services/aiService');
      const aiService = getAIService();
      const memSummary = aiService.getConversationContext(conversation_id) || {};
      const messages = memSummary.messages || [];

      const testUsers = require('./data/testUsers');
      const user = testUsers.find(u => u.id === user_id) || { name: 'Member', email: '' };

      const transcript = messages
        .map(m => `${m.role === 'user' ? user.name : 'AI'}: ${(m.content || '').replace(/<decision>.*<\/decision>/gs, '').trim()}`)
        .join('\n');
      const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);
      const issue = (userMsgs[0] || 'General inquiry').split('\n')[0].substring(0, 80);

      const resolvedCase = {
        id: `case-${conversation_id}`,
        conversation_id,
        user_id,
        user_email: user.email,
        user_name: user.name,
        issue_type: issue,
        status: 'resolved',
        priority: 'low',
        sentiment: 'positive',
        resolved_by: 'ai',
        message_count: messages.length,
        created_at: (conversationStartTimes.get(conversation_id)
          ? new Date(conversationStartTimes.get(conversation_id)).toISOString()
          : new Date().toISOString()),
        resolved_at: new Date().toISOString(),
        conversation_transcript: transcript,
        first_user_message: userMsgs[0] || '',
        ai_summary: messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '',
        escalated: false
      };
      aiResolvedConversations.set(conversationKey, resolvedCase);
      liveStats.auto_resolved += 1;
    }

    return res.json({ ok: true, was_escalated: wasEscalated, conversation_id });
  } catch (e) {
    console.error('Resolve error:', e);
    return res.status(500).json({ error: 'Failed to mark resolved' });
  }
});

// ============ CASE MANAGEMENT ROUTES ============
app.get('/api/cases', staffAuth, async (req, res) => {
  try {
    // Get all test users
    const testUsers = require('./data/testUsers');
    
    // Generate mock escalation cases from users with issues
    const mockCases = [];
    
    // Case 1: Fraud Alert - Michael Johnson's blocked card
    mockCases.push({
      id: 'case-001',
      conversation_id: 'conv-001-michael-card',
      user_id: 'user-003',
      user_email: 'michael.johnson@example.com',
      user_name: 'Michael Johnson',
      issue_type: 'Fraud Alert - Blocked Card',
      status: 'escalated',
      priority: 'high',
      sentiment: 'frustrated',
      message_count: 8,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      summary: {
        issue_category: 'Card Security',
        user_sentiment: 'frustrated',
        sentiment_score: 0.7,
        message_snippet: 'My debit card was blocked unexpectedly. I need it unblocked immediately!',
        requires_immediate_attention: true,
        conversation_summary: 'Customer reported debit card (ending in 3456) blocked without warning. Stated they had important purchases planned. Frustrated after multiple failed card attempts.',
        escalation_reason: 'card_blocking_dispute',
        team_assigned: 'Account Specialist',
        sla: '2 hours'
      }
    });
    
    // Case 2: Delinquent Account - Emily Davis
    mockCases.push({
      id: 'case-002',
      conversation_id: 'conv-002-emily-delinquent',
      user_id: 'user-004',
      user_email: 'emily.davis@example.com',
      user_name: 'Emily Davis',
      issue_type: 'Delinquent Account - Payment Assistance',
      status: 'escalated',
      priority: 'high',
      sentiment: 'worried',
      message_count: 12,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      summary: {
        issue_category: 'Account Delinquency',
        user_sentiment: 'worried',
        sentiment_score: 0.6,
        message_snippet: 'My personal loan is 45 days overdue. I\'m trying to catch up. Can you work with me?',
        requires_immediate_attention: true,
        conversation_summary: 'Customer has personal loan overdue 45 days ($4,200 remaining balance). Credit card also suspended. Customer employed but facing temporary hardship. Requested payment plan and financial counseling.',
        escalation_reason: 'delinquent_account',
        team_assigned: 'Collections & Hardship Specialist',
        sla: '4 hours'
      }
    });
    
    // Case 3: Dispute - Sarah Smith's unauthorized charge
    mockCases.push({
      id: 'case-003',
      conversation_id: 'conv-003-sarah-dispute',
      user_id: 'user-002',
      user_email: 'sarah.smith@example.com',
      user_name: 'Sarah Smith',
      issue_type: 'Transaction Dispute - Unauthorized Charge',
      status: 'escalated',
      priority: 'medium',
      sentiment: 'angry',
      message_count: 6,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      summary: {
        issue_category: 'Fraudulent Activity',
        user_sentiment: 'angry',
        sentiment_score: 0.8,
        message_snippet: 'I don\'t recognize a $450 charge from Shell gas station. I wasn\'t even in that state!',
        requires_immediate_attention: true,
        conversation_summary: 'Customer disputes $450 charge to Shell gas station. Claims she was not in that location. Possible card compromise. Requested transaction reversal and investigation.',
        escalation_reason: 'fraud_suspected',
        team_assigned: 'Dispute Resolution & Fraud',
        sla: '2 hours'
      }
    });
    
    // Case 4: Account Locked - Sophia Brown
    mockCases.push({
      id: 'case-004',
      conversation_id: 'conv-004-sophia-restricted',
      user_id: 'user-010',
      user_email: 'sophia.brown@example.com',
      user_name: 'Sophia Brown',
      issue_type: 'Account Restricted - Delinquent Payday Loan',
      status: 'escalated',
      priority: 'high',
      sentiment: 'distressed',
      message_count: 15,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      summary: {
        issue_category: 'Account Restrictions',
        user_sentiment: 'distressed',
        sentiment_score: 0.75,
        message_snippet: 'My account is restricted. I need access to buy groceries. Please help me!',
        requires_immediate_attention: true,
        conversation_summary: 'Customer account restricted due to 30-day payday loan delinquency. Customer in financial crisis, needs account access for essential expenses. Requesting emergency account access and flexible repayment arrangement.',
        escalation_reason: 'account_locked',
        team_assigned: 'Member Services & Hardship Team',
        sla: '1 hour'
      }
    });
    
    // Case 5: General Support - John Doe's balance question (auto-resolved, pending summary)
    mockCases.push({
      id: 'case-005',
      conversation_id: 'conv-005-john-balance',
      user_id: 'user-001',
      user_email: 'john.doe@example.com',
      user_name: 'John Doe',
      issue_type: 'Account Inquiry - Balance & Transactions',
      status: 'resolved',
      priority: 'low',
      sentiment: 'neutral',
      message_count: 3,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      summary: {
        issue_category: 'General Inquiry',
        user_sentiment: 'neutral',
        sentiment_score: 0.0,
        message_snippet: 'What is my current checking account balance?',
        requires_immediate_attention: false,
        conversation_summary: 'Customer requested balance check. Provided current balance of $5,432.50 in checking account. Customer satisfied with response. No further action needed.',
        escalation_reason: 'none',
        resolution_time_minutes: 2
      }
    });
    
    // ADD REAL ESCALATIONS + AI-RESOLVED CHATS FROM LIVE CONVERSATIONS
    const recentEscalations = Array.from(escalatedConversations.values());
    const recentAiResolved = Array.from(aiResolvedConversations.values())
      .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));

    // Real escalations first, then AI-resolved (live), then mock seeds
    const allCases = [...recentEscalations, ...recentAiResolved, ...mockCases];
    
    res.json(allCases);
  } catch (error) {
    console.error('Cases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

app.patch('/api/cases/:caseId', staffAuth, async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, resolution, notes } = req.body;
    
    // Mock response (no database required)
    res.json({
      id: caseId,
      status: status || 'updated',
      resolution: resolution || 'Case updated successfully',
      notes: notes || 'No additional notes',
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Case update error:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// ============ ANALYTICS ROUTES ============
app.get('/api/analytics/dashboard', staffAuth, async (req, res) => {
  try {
    const times = liveStats.resolution_times_ms;
    const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const total = liveStats.auto_resolved + liveStats.escalated;
    const escalatedLive = Array.from(escalatedConversations.values()).length;

    res.json({
      resolved_cases: liveStats.auto_resolved,
      escalated_cases: liveStats.escalated,
      pending_cases: escalatedLive,
      awaiting_context: liveStats.awaiting_context,
      avg_resolution_time_hours: +(avgMs / 3600000).toFixed(2),
      avg_resolution_time_seconds: +(avgMs / 1000).toFixed(1),
      auto_resolve_rate: total ? +((liveStats.auto_resolved / total) * 100).toFixed(1) : 0,
      escalation_rate: total ? +((liveStats.escalated / total) * 100).toFixed(1) : 0,
      sentiment_distribution: liveStats.by_sentiment,
      escalation_reasons: liveStats.by_reason,
      total_interactions: total
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============ WEBSOCKET SETUP ============
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type === 'typing') {
        // Broadcast typing indicator
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'user_typing',
              user_id: parsed.user_id,
              timestamp: new Date()
            }));
          }
        });
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ CreditAssist AI Backend running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Don't crash the process on a stray rejection — keep serving requests.
process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err?.message || err));
process.on('uncaughtException', (err) => console.error('uncaughtException:', err?.message || err));

module.exports = { app, pool, wss };
