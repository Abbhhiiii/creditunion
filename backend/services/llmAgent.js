/**
 * LLM Agent - Intelligent Conversational Agent
 * 100% Open-Source: Uses Ollama (local) with open-source models
 * Zero API limits, completely private, no external dependencies
 */

const axios = require('axios');
const ConversationMemory = require('./conversationMemory');
const { RAGEngine } = require('./ragEngine');

const ragSingleton = new RAGEngine();

// Bare escalation phrases (no other context in the message)
const BARE_ESCALATION_PATTERNS = [
  /^\s*(please\s+)?(alert|escalate|escalation)\s*[!.?]*\s*$/i,
  /^\s*(i\s+want\s+to\s+)?escalate\s+(this|my\s+(issue|case|request))\s*[!.?]*\s*$/i,
  /^\s*(raise\s+an?\s+)?alert\s*[!.?]*\s*$/i,
  /^\s*(talk|speak)\s+to\s+(a\s+)?(human|agent|manager|supervisor)\s*[!.?]*\s*$/i
];

function isBareEscalation(msg) {
  return BARE_ESCALATION_PATTERNS.some(p => p.test(msg.trim()));
}

class LLMAgent {
  constructor() {
    // Cloud-friendly LLM stack: prefer Groq (OpenAI-compatible, free tier).
    // Falls back to Ollama for local dev when GROQ_API_KEY is unset.
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.groqUrl = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
    this.groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || process.env.LLM_MODEL || 'mistral';

    this.provider = this.groqApiKey ? 'groq' : 'ollama';
    this.defaultModel = this.provider === 'groq' ? this.groqModel : this.ollamaModel;
    this.conversationMemories = {};

    console.log(`🤖 LLM Agent initialized — provider=${this.provider} model=${this.defaultModel}`);
    if (this.provider === 'ollama') this.testOllamaConnection();
  }

  /**
   * Test Ollama connection and available models
   */
  async testOllamaConnection() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const models = response.data.models || [];
      console.log(`✓ Ollama connected - Available models: ${models.map(m => m.name).join(', ')}`);
    } catch (error) {
      console.warn(`⚠️  Ollama not running. Start it with: ollama serve`);
      console.warn(`   Then pull a model: ollama pull mistral`);
    }
  }

  getMemory(conversationId) {
    if (!this.conversationMemories[conversationId]) {
      this.conversationMemories[conversationId] = new ConversationMemory(conversationId);
    }
    return this.conversationMemories[conversationId];
  }

  /**
   * Provider-agnostic LLM call. Uses Groq when GROQ_API_KEY is set (cloud
   * deployment), Ollama otherwise (local dev).
   */
  async callOllama(messages, temperature = 0.7) {
    if (this.provider === 'groq') return this.callGroq(messages, temperature);
    return this.callLocalOllama(messages, temperature);
  }

  async callGroq(messages, temperature = 0.7) {
    try {
      const response = await axios.post(
        this.groqUrl,
        {
          model: this.groqModel,
          messages,
          temperature,
          max_tokens: 400,
          top_p: 0.9
        },
        {
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data?.choices?.[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      console.error('Groq error:', error.response?.data || error.message);
      throw new Error('LLM service unavailable (Groq).');
    }
  }

  async callLocalOllama(messages, temperature = 0.7) {
    try {
      const prompt = messages.map(m => {
        if (m.role === 'system') return `System: ${m.content}`;
        if (m.role === 'assistant') return `Assistant: ${m.content}`;
        return `User: ${m.content}`;
      }).join('\n');

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt,
          stream: false,
          temperature,
          top_k: 40,
          top_p: 0.9,
          num_predict: 256
        },
        { timeout: 120000 }
      );
      return response.data.response || 'Unable to generate response';
    } catch (error) {
      console.error('Ollama error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        return `I'm temporarily unavailable. Please start Ollama (ollama serve) or set GROQ_API_KEY in the environment.`;
      }
      throw new Error('LLM service unavailable.');
    }
  }

  /**
   * Process user message with conversation context
   */
  async processMessage(userMessage, conversationId, userId, metadata = {}) {
    const memory = this.getMemory(conversationId);

    // Add user message to memory
    memory.addMessage('user', userMessage, metadata);

    try {
      // Load company policies
      const policies = require('../data/companyPolicies');
      const userContext = metadata.userContext || {};

      // Load the operating policy KB doc (always injected, not just when keyword-matched)
      const policyDoc = ragSingleton.documents
        .filter(d => d.filename === 'bank-escalation-policy.txt')
        .map(d => d.content)
        .join('\n\n');

      // RAG: retrieve topical KB chunks for the user's question
      let ragContext = '';
      try {
        const intent = this.extractIntent(userMessage);
        const chunks = (await ragSingleton.retrieve(userMessage, { type: intent }, 4))
          .filter(c => c.source !== 'bank-escalation-policy.txt');
        if (chunks && chunks.length) {
          ragContext = '\n\nRELEVANT BANK KNOWLEDGE (use these to answer — do not invent):\n' +
            chunks.map((c, i) => `[${i + 1}] (${c.source})\n${c.content}`).join('\n\n');
        }
      } catch (e) {
        console.warn('[LLMAgent] RAG retrieval failed:', e.message);
      }

      const overdueLoans = (userContext.loans || []).filter(l => l.daysOverdue > 0);
      const aiTurnCount = memory.getMessages().filter(m => m.role === 'assistant').length;

      const systemPromptText = `You are CreditAssist, the AI agent for Union Credit Bank. Every reply you produce is governed by the OPERATING POLICY below. You must follow it literally.

============ OPERATING POLICY (authoritative) ============
${policyDoc}
============ END OPERATING POLICY ============

MEMBER PROFILE (use actual values, do not invent):
- Name: ${userContext.name || 'Unknown'}
- Account status: ${userContext.accountStatus || 'unknown'}
- Accounts: ${(userContext.accounts || []).map(a => `${a.type} ${a.accountNumber} $${a.balance.toFixed(2)} [${a.status}]`).join('; ') || 'none'}
- Cards: ${(userContext.cards || []).map(c => `${c.type} …${c.last4} [${c.status}]`).join('; ') || 'none'}
- Loans: ${(userContext.loans || []).map(l => `${l.type} remaining $${l.remaining} overdue ${l.daysOverdue}d [${l.status}]`).join('; ') || 'none'}
- Overdue loans present: ${overdueLoans.length > 0 ? 'YES' : 'NO'}
- AI replies so far in this conversation: ${aiTurnCount}

RESPONSE RULES
1. Answer the member directly and specifically. Use their name and their real numbers.
2. For Section A items (balance, transactions, rates, procedures, small talk) RESOLVE — answer fully, no escalation.
3. Only escalate if the message matches a Section B trigger. A greeting or pure info question NEVER escalates, even if the profile shows risk.
4. If the member asks for a human with no context, CLARIFY (ask one question). Do not escalate yet.
5. Keep replies under 5 short sentences unless explanation is needed.
6. After your reply, append EXACTLY ONE line:
   <decision>{"action":"resolve|clarify|escalate","reason":"<CODE or null>"}</decision>
   Use the reason codes listed in Section E. Nothing after this line.
${ragContext}`;

      const systemPrompt = {
        role: 'system',
        content: systemPromptText
      };

      // Get conversation context (last 5 messages for context window)
      const recentMessages = memory.getMessages().slice(-5);
      const conversationContext = recentMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Build messages for LLM
      const messages = [
        systemPrompt,
        ...conversationContext,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Get response from Ollama (local, open-source, no limits)
      const rawReply = await this.callOllama(messages);

      // Strip any <decision> tag the LLM may emit and use the deterministic
      // policy logic to decide escalation — small models are unreliable at
      // honoring the tag, so we make this a code-side decision.
      const { visibleReply } = this.parseDecision(rawReply);

      // Detect bare escalation request (no context) → ask for context
      const prior = memory.getMessages().slice(0, -1);
      const hasPriorUserContext = prior.some(m => m.role === 'user' && m.content.trim().length > 20);
      const awaitingContext = isBareEscalation(userMessage) && !hasPriorUserContext;

      // Deterministic policy escalation (greetings/info NEVER escalate)
      const ruleEscalate = !awaitingContext && this.analyzeEscalation(userMessage, visibleReply, memory, {}, userContext);
      const unresolved = !awaitingContext && this.detectUnresolved(userMessage, memory);
      const finalEscalate = ruleEscalate || unresolved;
      const escalationReason = !finalEscalate
        ? null
        : (unresolved && !ruleEscalate
            ? 'PERSISTENT_DISSATISFACTION'
            : this.extractEscalationReason(userMessage, visibleReply, userContext));
      const action = finalEscalate ? 'escalate' : (awaitingContext ? 'clarify' : 'resolve');

      // Escalation banner — no phone numbers, no SLAs, no team names
      let aiResponse = visibleReply;
      if (awaitingContext) {
        aiResponse = `I can connect you with a specialist right away${userContext.name ? `, ${userContext.name}` : ''}. Before I escalate, could you briefly tell me what you need help with — for example a card issue, an unauthorized charge, or a loan question? That way I can route you to the right team with full context.`;
      }
      if (finalEscalate) {
        const nameStr = userContext.name ? `, ${userContext.name}` : '';
        const banner = `🚨 I'm escalating this for you${nameStr}. Our support team has received the full summary of our conversation and will take it from here — you won't need to repeat yourself.\n\n---\n\n`;
        aiResponse = banner + visibleReply;
      }

      // Add AI response to memory (the cleaned visible reply, no decision tag)
      memory.addMessage('assistant', aiResponse);

      // Expose awaiting_context flag so server-side analytics tracks it
      var __awaitingContext = awaitingContext;

      return {
        content: aiResponse,
        conversationId: conversationId,
        shouldEscalate: finalEscalate,
        intent: this.extractIntent(userMessage),
        sentiment: this.analyzeSentiment(userMessage),
        confidence: 0.95,
        llmModel: this.defaultModel,
        timestamp: new Date().toISOString(),
        metadata: {
          escalation_reason: finalEscalate ? escalationReason : null,
          escalated: finalEscalate,
          awaiting_context: __awaitingContext,
          policy_action: action,
          conversation_memory: memory.getSummary()
        }
      };
    } catch (error) {
      console.error('Agent error:', error);
      throw error;
    }
  }

  /**
   * Parse the <decision>{...}</decision> tag the LLM appends per policy.
   * Falls back to "resolve" if the model omits or malforms the tag.
   */
  parseDecision(raw) {
    const match = raw.match(/<decision>\s*([\s\S]*?)\s*<\/decision>/i);
    let visibleReply = raw.replace(/<decision>[\s\S]*?<\/decision>/i, '').trim();
    if (!visibleReply) visibleReply = raw.trim();

    if (!match) {
      return { visibleReply, action: 'resolve', reason: null };
    }
    try {
      const obj = JSON.parse(match[1]);
      const action = ['resolve', 'clarify', 'escalate'].includes(obj.action) ? obj.action : 'resolve';
      const reason = obj.reason === null || obj.reason === undefined ? null : String(obj.reason);
      return { visibleReply, action, reason };
    } catch (e) {
      return { visibleReply, action: 'resolve', reason: null };
    }
  }

  /**
   * Detect when AI hasn't resolved the issue after several attempts.
   * Triggers when the user signals the problem persists after at least
   * 2 AI responses, OR after 4+ user turns without a positive signal.
   */
  detectUnresolved(userMessage, memory) {
    const msg = userMessage.toLowerCase().trim();
    const trivial = /^(hi|hello|hey|yo|hola|namaste|good (morning|afternoon|evening)|thanks|thank you|thx|ty|ok|okay|bye|goodbye|cool|nice|great|sure|yes|no|hmm)[\s!.?]*$/i;
    if (trivial.test(msg)) return false;
    const all = memory.getMessages();
    const userTurns = all.filter(m => m.role === 'user').length;
    const aiTurns = all.filter(m => m.role === 'assistant').length;

    const stillFailing = /\b(still|again|didn'?t (work|help)|not (working|resolved|solved|fixed|helping)|doesn'?t (work|help)|same (problem|issue)|no progress|hasn'?t (helped|worked))\b/i;
    const givingUp = /\b(give up|forget it|useless|can'?t (take|handle)|nothing (is )?working)\b/i;

    if (aiTurns >= 2 && (stillFailing.test(msg) || givingUp.test(msg))) return true;

    // Long conversation with no positive closure signal
    if (userTurns >= 4) {
      const recent = all.slice(-6).map(m => m.content.toLowerCase()).join(' ');
      const positive = /\b(thank|thanks|resolved|solved|got it|great|perfect|that works|helpful)\b/.test(recent);
      if (!positive) return true;
    }

    return false;
  }

  /**
   * Analyze if conversation should be escalated
   */
  analyzeEscalation(userMessage, aiResponse, memory, policies = {}, userContext = {}) {
    const msg = userMessage.toLowerCase().trim();
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();

    // GREETINGS / TRIVIAL INFO REQUESTS — never escalate
    const trivial = /^(hi|hello|hey|yo|hola|namaste|good (morning|afternoon|evening)|thanks|thank you|thx|ty|ok|okay|bye|goodbye|cool|nice|great|sure|yes|no|hmm|\W*)[\s!.?]*$/i;
    if (trivial.test(msg)) return false;

    const infoQuestion = /^(what|how|when|where|show|tell|can you (show|tell|explain))\b/i;
    const accountInfoOnly = /\b(balance|statement|transactions?|interest rate|hours|branch|limit|rate)\b/i;
    const hasProblemSignal = /\b(issue|problem|help|wrong|error|can't|cannot|broken|stuck|angry|frustrat|fraud|dispute|urgent|unauthorized|stolen|overdue|delinquent|locked|suspended|blocked)\b/i;
    const looksLikePureInfo = infoQuestion.test(msg) && accountInfoOnly.test(msg) && !hasProblemSignal.test(msg);

    // EXPLICIT ESCALATION REQUESTS
    const explicitEscalationKeywords = ['escalate', 'talk to manager', 'talk to supervisor', 'speak to specialist', 'need a specialist', 'want to escalate', 'please escalate', 'i want to escalate', 'escalate this', 'further escalation', 'talk to human', 'speak to human', 'human agent'];
    if (explicitEscalationKeywords.some(kw => msg.includes(kw))) return true;

    // FRAUD DETECTION
    const fraudKeywords = ['fraudulent', 'unauthorized', 'fraud', 'stolen', 'hacked', 'scam', 'suspicious charge', 'wrong charge', 'not me'];
    if (fraudKeywords.some(kw => combinedText.includes(kw))) return true;

    // LEGAL THREATS
    const legalKeywords = ['lawsuit', 'attorney', 'court', 'legal action', 'sue '];
    if (legalKeywords.some(kw => combinedText.includes(kw))) return true;

    // DISPUTE DETECTION
    const disputeKeywords = ['dispute', 'wrong charge', 'charged me incorrectly', 'incorrect charge'];
    if (disputeKeywords.some(kw => combinedText.includes(kw))) return true;

    // SENTIMENT-BASED (only if user is showing real frustration/anger, not on pure info queries)
    if (!looksLikePureInfo) {
      const sentiment = this.analyzeSentiment(userMessage);
      if (sentiment === 'frustrated' || sentiment === 'angry') return true;
    }

    // ACCOUNT-STATUS TRIGGERS — only fire when the user actually raises a problem,
    // not on greetings or pure info lookups.
    if (hasProblemSignal.test(msg)) {
      if (userContext.loans?.some(l => l.daysOverdue > 30)) return true;
      if (userContext.accountStatus === 'active_restricted' || userContext.accountStatus === 'suspended') return true;
    }

    return false;
  }

  /**
   * Extract escalation reason for case tracking
   */
  extractEscalationReason(userMessage, aiResponse, userContext = {}) {
    const msg = userMessage.toLowerCase();
    const combined = (userMessage + ' ' + aiResponse).toLowerCase();

    if (combined.includes('fraud') || combined.includes('unauthorized') || combined.includes('stolen') || combined.includes('hacked') || combined.includes('scam')) {
      return 'FRAUD_SUSPECTED';
    }
    if (/\b(lawsuit|attorney|legal action|court|regulator|ombudsman|sue|suing)\b/.test(combined)) {
      return 'LEGAL_THREAT';
    }
    if (combined.includes('dispute') || combined.includes('wrong charge') || combined.includes('charged me incorrectly')) {
      return 'TRANSACTION_DISPUTE';
    }
    if (combined.includes('locked') || combined.includes('suspended') || combined.includes('frozen') || combined.includes('restricted')) {
      return 'ACCOUNT_LOCK_RESTRICTION';
    }
    if (userContext.loans?.some(l => l.daysOverdue > 30) && /\b(payment|overdue|delinquent|hardship|behind|catch up|can'?t pay)\b/.test(msg)) {
      return 'DELINQUENCY_HARDSHIP';
    }
    const explicitHuman = ['escalate', 'talk to manager', 'talk to supervisor', 'speak to specialist', 'talk to human', 'speak to human', 'human agent', 'real person'];
    if (explicitHuman.some(kw => msg.includes(kw))) {
      return 'EXPLICIT_HUMAN_REQUEST';
    }
    if (/\b(transfer|wire|close.*account|waive.*fee|reverse.*charge|unblock)\b/.test(msg)) {
      return 'OUT_OF_SCOPE_REQUEST';
    }
    const sentiment = this.analyzeSentiment(userMessage);
    if (sentiment === 'angry' || sentiment === 'frustrated' || sentiment === 'urgent') {
      return 'GENUINE_ANGER_OR_DISTRESS';
    }
    return 'EXPLICIT_HUMAN_REQUEST';
  }

  /**
   * Extract intent from user message
   */
  extractIntent(message) {
    const intents = {
      balance: /balance|account.*status|how.*money/i,
      card: /card|debit|credit|block|freeze|cancel/i,
      loan: /loan|borrow|mortgage|credit/i,
      transfer: /transfer|send|payment|pay/i,
      dispute: /dispute|charge|transaction|fraud|unauthorized/i,
      general: /hello|hi|help|support/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) return intent;
    }

    return 'general';
  }

  /**
   * Analyze sentiment with enhanced frustration and urgency detection
   */
  analyzeSentiment(message) {
    const msg = message.toLowerCase();
    
    // Frustration indicators
    const frustration = /frustrated|frustrating|annoyed|stuck|can't|cannot|won't|won't|doesn't work|broken|help me|fix this|unacceptable|ridiculous|absurd|incompetent/i;
    if (frustration.test(msg)) return 'frustrated';
    
    // Urgency indicators
    const urgency = /urgent|immediately|asap|emergency|right now|now|hurry|quickly|quick|fast|need help immediately|urgent help|critical|dying|can't wait|must|have to/i;
    if (urgency.test(msg)) return 'urgent';
    
    // Anger indicators
    const angry = /angry|furious|outraged|furious|hate|terrible|awful|worst|disgusting|unacceptable|infuriated/i;
    if (angry.test(msg)) return 'angry';
    
    // Positive indicators
    const positive = /happy|thank|great|perfect|excellent|solved|wonderful|amazing|fantastic|love it/i;
    if (positive.test(msg)) return 'positive';
    
    // Negative indicators
    const negative = /bad|poor|disappointing|disappointed|upset|sad|wrong|error|problem|issue/i;
    if (negative.test(msg)) return 'negative';
    
    return 'neutral';
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(conversationId) {
    const memory = this.getMemory(conversationId);
    return memory.getSummary();
  }

  /**
   * Clear conversation (for privacy)
   */
  clearConversation(conversationId) {
    delete this.conversationMemories[conversationId];
  }
}

// Singleton instance
let agentInstance = null;

function getAgent() {
  if (!agentInstance) {
    agentInstance = new LLMAgent();
  }
  return agentInstance;
}

module.exports = { LLMAgent, getAgent };
