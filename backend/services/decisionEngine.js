/**
 * Decision Engine - Determines resolution path
 * Routes between auto-resolution, RAG, action, or escalation
 */

const decisionEngine = {
  /**
   * Make decision on how to resolve user request
   */
  async decide(context) {
    const { intent, sentiment, message, ragResults, conversationHistory } = context;
    
    // High priority escalation cases
    if (sentiment.requires_escalation) {
      return this.escalateCase(intent, sentiment, message, 'high');
    }
    
    // Route by intent type
    switch (intent.type) {
      case 'balance_inquiry':
        return {
          type: 'auto_resolve',
          status: 'resolved',
          data: {
            balance: 5234.50, // Mock data - fetch from DB in production
            card_type: 'Checking'
          },
          message: 'Your balance retrieved successfully'
        };
      
      case 'card_block':
        return {
          type: 'auto_resolve',
          status: 'resolved',
          data: {
            card_type: 'Debit Card',
            block_time: new Date(),
            replacement_delivery: '7 business days'
          },
          message: 'Card blocked successfully'
        };
      
      case 'card_unblock':
        return {
          type: 'auto_resolve',
          status: 'resolved',
          data: {
            card_type: 'Debit Card',
            unblock_time: new Date(),
            available_immediately: true
          },
          message: 'Card unblocked successfully'
        };
      
      case 'account_update':
        return {
          type: 'action_required',
          status: 'pending',
          action: 'update account information',
          steps: [
            'Visit our website and log in',
            'Go to Account Settings',
            'Click Edit Profile',
            'Make your changes and save'
          ],
          message: 'You can update your information online'
        };
      
      case 'transaction_dispute':
        if (this.isSimpleDispute(message)) {
          return {
            type: 'rag_answer',
            status: 'in_progress',
            message: 'Providing dispute process information'
          };
        } else {
          return this.escalateCase(intent, sentiment, message, 'high');
        }
      
      case 'loan_status':
        return this.escalateCase(intent, sentiment, message, 'medium');
      
      case 'interest_rate':
      case 'fee_inquiry':
        return {
          type: 'rag_answer',
          status: 'resolved',
          message: 'Retrieving information from knowledge base'
        };
      
      case 'complaint':
        return this.escalateCase(intent, sentiment, message, 'high');
      
      case 'greeting':
        return {
          type: 'auto_resolve',
          status: 'resolved',
          message: 'How can I help you today? I can assist with balance inquiries, card management, disputes, and more.'
        };
      
      default:
        return this.escalateCase(intent, sentiment, message, 'medium');
    }
  },
  
  /**
   * Check if dispute is simple enough to auto-handle
   */
  isSimpleDispute(message) {
    const hasAmount = /\$?\d+/.test(message);
    const isMissingTransaction = message.match(/charge|payment|missing/i);
    return hasAmount && isMissingTransaction;
  },
  
  /**
   * Create escalation with structured summary
   */
  escalateCase(intent, sentiment, message, priority) {
    const caseId = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      type: 'escalate',
      status: 'escalated',
      case_id: caseId,
      priority: priority, // 'low', 'medium', 'high'
      issue_type: intent.type,
      sentiment: sentiment.type,
      confidence: intent.confidence,
      message: message,
      sla: this.getSLA(priority),
      actions: [
        'Case created and assigned to support team',
        'You will receive email confirmation',
        `We will contact you within ${this.getSLA(priority)} hours`
      ],
      summary: {
        issue_category: intent.type,
        user_sentiment: sentiment.type,
        sentiment_score: sentiment.score,
        message_snippet: message.substring(0, 150),
        requires_immediate_attention: sentiment.requires_escalation
      }
    };
  },
  
  /**
   * Get SLA based on priority
   */
  getSLA(priority) {
    const slaMap = {
      'high': 2,
      'medium': 4,
      'low': 24
    };
    return slaMap[priority] || 4;
  }
};

module.exports = { decisionEngine };
