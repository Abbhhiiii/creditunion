/**
 * Intent Classifier - Advanced NLP-based Intent Detection
 * Uses natural language processing for semantic understanding
 */

const natural = require('natural');

// Initialize NLP tokenizer and classifier
const tokenizer = new natural.WordTokenizer();
const PorterStemmer = natural.PorterStemmer;

// Intent definitions with semantic features
const intentDefinitions = {
  balance_inquiry: {
    keywords: ['balance', 'how much', 'account balance', 'my balance', 'total amount', 'checking', 'savings'],
    patterns: [/balance/i, /how much/i, /amount in/i, /check.*balance/i],
    weight: 1.0,
    autoResolvable: true
  },
  
  transaction_dispute: {
    keywords: ['dispute', 'wrong', 'unauthorized', 'not me', 'charge', 'transaction', 'problem', 'fraudulent'],
    patterns: [/dispute/i, /unauthorized/i, /didn't authorize/i, /fraudulent/i],
    weight: 1.2,
    autoResolvable: false, // Always escalate
    escalationPriority: 'high'
  },
  
  loan_status: {
    keywords: ['loan', 'status', 'application', 'approval', 'when', 'decision', 'funded', 'disbursement'],
    patterns: [/loan.*status/i, /loan.*application/i, /when.*decision/i],
    weight: 0.9,
    autoResolvable: false
  },
  
  card_block: {
    keywords: ['block', 'card', 'lost', 'stolen', 'freeze', 'cancel', 'suspend'],
    patterns: [/block.*card/i, /lost.*card/i, /stolen.*card/i, /freeze.*card/i],
    weight: 1.0,
    autoResolvable: true,
    escalationPriority: 'urgent'
  },
  
  account_update: {
    keywords: ['update', 'change', 'address', 'phone', 'email', 'name', 'modify'],
    patterns: [/update.*address/i, /change.*phone/i, /new.*email/i],
    weight: 0.8,
    autoResolvable: true
  },
  
  interest_rate: {
    keywords: ['interest', 'rate', 'apy', 'earn', 'percent', 'return', 'yield'],
    patterns: [/interest.*rate/i, /apy/i, /earn/i],
    weight: 0.8,
    autoResolvable: true
  },
  
  complaint: {
    keywords: ['complaint', 'problem', 'issue', 'frustrated', 'unhappy', 'service', 'quality'],
    patterns: [/complaint/i, /problem/i, /frustrated/i],
    weight: 1.3,
    autoResolvable: false,
    escalationPriority: 'high'
  },
  
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'thanks', 'please'],
    patterns: [/^hello/i, /^hi /i, /^hey/i, /thanks/i],
    weight: 0.5,
    autoResolvable: true
  }
};

// Advanced intent classifier with semantic similarity
const intentClassifier = {
  /**
   * Classify user intent using NLP techniques
   */
  async classify(message) {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(t => PorterStemmer.stem(t));
    
    const scores = {};
    
    // Score each intent
    for (const [intentName, definition] of Object.entries(intentDefinitions)) {
      scores[intentName] = this.calculateIntentScore(
        message,
        tokens,
        stemmedTokens,
        definition
      );
    }
    
    // Find top intent
    const topIntent = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );
    
    const confidence = Math.min(scores[topIntent[0]] / 100, 1.0);
    const intentDef = intentDefinitions[topIntent[0]];
    
    return {
      category: topIntent[0],
      confidence,
      autoResolvable: intentDef.autoResolvable,
      escalationPriority: intentDef.escalationPriority,
      allScores: scores
    };
  },

  calculateIntentScore(message, tokens, stemmedTokens, definition) {
    let score = 0;
    const lowerMessage = message.toLowerCase();
    
    // Pattern matching (highest weight)
    for (const pattern of definition.patterns) {
      if (pattern.test(message)) {
        score += 50 * definition.weight;
      }
    }
    
    // Keyword matching with stemming
    for (const keyword of definition.keywords) {
      const keywordStemmed = PorterStemmer.stem(keyword);
      
      // Exact keyword match
      if (lowerMessage.includes(keyword)) {
        score += 30 * definition.weight;
      }
      
      // Stemmed token match
      if (stemmedTokens.includes(keywordStemmed)) {
        score += 20 * definition.weight;
      }
    }
    
    // Semantic similarity bonus (token overlap)
    const keywordTokens = definition.keywords
      .join(' ')
      .split(/\s+/)
      .map(t => PorterStemmer.stem(t));
    
    const overlap = stemmedTokens.filter(t => keywordTokens.includes(t)).length;
    score += overlap * 15 * definition.weight;
    
    return score;
  }
};

module.exports = { intentClassifier };
   */
  classify(message) {
    const cleanMessage = message.toLowerCase().trim();
    const scores = {};
    
    // Calculate confidence for each intent
    for (const [intentType, config] of Object.entries(intentPatterns)) {
      let score = 0;
      
      // Check keywords (weighted)
      for (const keyword of config.keywords) {
        if (cleanMessage.includes(keyword)) {
          score += 0.3;
        }
      }
      
      // Check patterns (weighted more)
      for (const pattern of config.patterns) {
        if (pattern.test(message)) {
          score += 0.7;
        }
      }
      
      scores[intentType] = Math.min(score, 1.0); // Cap at 1.0
    }
    
    // Find best match
    const bestMatch = Object.entries(scores).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    );
    
    const [type, confidence] = bestMatch;
    
    return {
      type,
      confidence: confidence,
      category: this.getCategory(type),
      all_scores: scores
    };
  },
  
  /**
   * Get intent category for routing
   */
  getCategory(intentType) {
    const categories = {
      balance_inquiry: 'information',
      transaction_dispute: 'action',
      loan_status: 'information',
      card_block: 'action',
      card_unblock: 'action',
      account_update: 'action',
      interest_rate: 'information',
      fee_inquiry: 'information',
      complaint: 'escalation',
      greeting: 'greeting'
    };
    
    return categories[intentType] || 'other';
  }
};

module.exports = { intentClassifier };
