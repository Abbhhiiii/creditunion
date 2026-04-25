/**
 * Union Credit Company Policies
 * Escalation Rules, Communication Guidelines, Service Standards
 */

const companyPolicies = {
  // ============ ESCALATION CRITERIA ============
  escalationRules: {
    immediate: {
      name: 'Immediate Escalation (Contact Manager)',
      triggers: [
        {
          category: 'FRAUD_SUSPECTED',
          keywords: ['fraudulent', 'unauthorized', 'fraud', 'stolen'],
          sentiment: 'angry',
          action: 'Immediately escalate to fraud department'
        },
        {
          category: 'DELINQUENT_ACCOUNT',
          rule: 'account.loans.some(l => l.daysOverdue > 60)',
          action: 'Route to collections specialist'
        },
        {
          category: 'ACCOUNT_DISPUTE',
          keywords: ['disputed', 'wrong charge', 'error', 'incorrect'],
          sentiment: 'frustrated',
          action: 'Create dispute ticket and escalate'
        },
        {
          category: 'LEGAL_THREAT',
          keywords: ['lawsuit', 'attorney', 'court', 'legal action'],
          sentiment: 'angry',
          action: 'Immediate escalation to legal team'
        }
      ]
    },
    urgent: {
      name: 'Urgent Escalation (1-2 Hours)',
      triggers: [
        {
          category: 'ACCOUNT_LOCKED',
          keywords: ['locked', 'blocked', 'suspended'],
          sentiment: 'frustrated',
          action: 'Escalate to account specialist'
        },
        {
          category: 'LARGE_WITHDRAWAL',
          rule: 'transaction.amount > account.balance * 0.5',
          action: 'Verify with customer, escalate if unusual'
        },
        {
          category: 'LOAN_DEFAULT_RISK',
          rule: 'account.loans.some(l => l.daysOverdue > 30)',
          sentiment: 'negative',
          action: 'Contact loan specialist'
        },
        {
          category: 'MULTIPLE_FAILED_ATTEMPTS',
          keywords: ['tried', 'failed', 'multiple times', 'keep trying'],
          sentiment: 'frustrated',
          action: 'Escalate to technical support'
        }
      ]
    },
    standard: {
      name: 'Standard Escalation (24 Hours)',
      triggers: [
        {
          category: 'PRODUCT_INQUIRY',
          keywords: ['loan', 'mortgage', 'credit', 'refinance'],
          confidence: 'medium',
          action: 'Route to product specialist'
        },
        {
          category: 'BILLING_QUESTION',
          keywords: ['fee', 'charge', 'cost', 'price'],
          action: 'Route to billing department'
        }
      ]
    }
  },

  // ============ ACCOUNT RISK ASSESSMENT ============
  riskAssessment: {
    low: {
      maxAutoResolution: 'any',
      escalationThreshold: 'only explicit requests',
      trustLevel: 'high'
    },
    medium: {
      maxAutoResolution: 5000,
      escalationThreshold: 'transactions > $2000, complaints',
      trustLevel: 'medium'
    },
    high: {
      maxAutoResolution: 500,
      escalationThreshold: 'all requests',
      trustLevel: 'low',
      specialHandling: 'always mention live agent availability'
    }
  },

  // ============ AUTO-RESOLUTION SCOPE ============
  autoResolution: {
    allowed: [
      {
        type: 'balance_inquiry',
        conditions: 'always',
        response: 'Provide balance directly from profile'
      },
      {
        type: 'recent_transactions',
        conditions: 'riskScore !== "high"',
        response: 'Show last 10 transactions'
      },
      {
        type: 'account_info',
        conditions: 'always',
        response: 'Provide account type, status, interest rates'
      },
      {
        type: 'card_status',
        conditions: 'always',
        response: 'Show card status (active/blocked/suspended)'
      },
      {
        type: 'loan_status',
        conditions: 'daysOverdue < 30',
        response: 'Provide loan balance, payment schedule'
      },
      {
        type: 'password_reset',
        conditions: 'security verification',
        response: 'Process reset with 2FA verification'
      }
    ],
    notAllowed: [
      'Transfer funds',
      'Wire money',
      'Close account',
      'Modify limits',
      'Dispute charges',
      'Approve loans',
      'Waive fees',
      'Change account settings'
    ]
  },

  // ============ COMMUNICATION GUIDELINES ============
  communicationStandards: {
    tone: {
      default: 'professional, friendly, empathetic',
      frustrated_customer: 'extra empathetic, apologetic, solution-focused',
      angry_customer: 'calm, respectful, acknowledge frustration, escalate quickly'
    },
    addressingCustomers: {
      use: 'customer first name when available',
      avoid: 'generic "customer" or "user"'
    },
    disclosures: {
      always_mention: [
        'APY/Interest rates when discussing savings/loans',
        'Fees when applicable',
        'Escalation option when cannot resolve'
      ]
    },
    followup: {
      escalated_cases: 'Schedule follow-up within 24 hours',
      unresolved_issues: 'Provide reference number and escalation timeline'
    }
  },

  // ============ ACCOUNT STATUS ACTIONS ============
  accountStatusActions: {
    active: {
      allowedOperations: ['inquiries', 'transactions', 'applications'],
      escalationLikelihood: 'low'
    },
    active_restricted: {
      allowedOperations: ['inquiries only'],
      escalationLikelihood: 'high',
      note: 'Mention available specialist'
    },
    suspended: {
      allowedOperations: 'none',
      escalationLikelihood: 'immediate',
      action: 'Always escalate with explanation'
    },
    closed: {
      allowedOperations: 'view only',
      escalationLikelihood: 'inform of closure'
    }
  },

  // ============ RESPONSE TEMPLATES ============
  responseTemplates: {
    balanceInquiry: {
      success: 'Hi {name}, your current {accountType} balance is ${balance}. Is there anything else I can help you with?',
      negative: 'Hi {name}, your current {accountType} balance is ${balance}. I notice this is lower than usual. Would you like to discuss a savings plan?'
    },
    escalation: {
      immediate: 'I understand this is urgent. I\'m connecting you with a specialist right now who can resolve this immediately.',
      standard: 'This requires a specialist review. I\'ve created a case for you and {team} will contact you within {timeframe}. Your reference number is {caseId}.',
      delinquent: 'I see there\'s an overdue balance. Our collections specialist can work with you on a payment plan. Let me connect you now.'
    },
    noAuthorization: {
      standard: 'I\'m not able to make that change, but I can connect you with someone who can help. Would you like me to escalate?'
    }
  },

  // ============ ESCALATION TEAM ROUTING ============
  teamRouting: {
    fraud: {
      team: 'Fraud Prevention Department',
      sla: '15 minutes',
      availability: '24/7'
    },
    collections: {
      team: 'Collections Specialist',
      sla: '2 hours',
      availability: 'Business hours + emergency'
    },
    disputes: {
      team: 'Dispute Resolution Team',
      sla: '4 hours',
      availability: 'Business hours'
    },
    products: {
      team: 'Product Specialist',
      sla: '24 hours',
      availability: 'Business hours'
    },
    technical: {
      team: 'Technical Support',
      sla: '1 hour',
      availability: '24/7'
    },
    legal: {
      team: 'Legal Department',
      sla: 'Immediate',
      availability: '24/7'
    }
  },

  // ============ COMPLIANCE RULES ============
  compliance: {
    dataProtection: [
      'Never ask for full SSN over chat (only last 4)',
      'Never ask for full card numbers (only last 4)',
      'Never ask for passwords',
      'Always confirm verification before discussing sensitive info'
    ],
    errorHandling: [
      'If transaction failed, never assume root cause',
      'Always escalate technical errors',
      'Confirm with customer before making any changes'
    ],
    recordKeeping: [
      'Log all interactions in case file',
      'Document escalation reason',
      'Track resolution outcome'
    ]
  }
};

module.exports = companyPolicies;
