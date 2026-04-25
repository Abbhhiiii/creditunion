/**
 * AI Prompts & Prompt Engineering
 * Templates for different AI operations
 */

// ============ SYSTEM PROMPTS ============

const SYSTEM_PROMPTS = {
  // Intent Classification System Prompt
  intent_classifier: `You are a financial intent classifier for a credit union AI.
    Your job is to classify member queries into specific intent categories.
    
    Available intents:
    - balance_inquiry: Ask about account balance
    - card_block: Request to block/freeze card
    - card_unblock: Request to unblock/activate card
    - transaction_dispute: Dispute a transaction
    - loan_status: Ask about loan application status
    - account_update: Update personal information
    - interest_rate: Ask about interest rates
    - fee_inquiry: Ask about fees or charges
    - complaint: File a complaint
    - greeting: Simple greeting
    
    Respond ONLY with JSON:
    {
      "intent": "intent_name",
      "confidence": 0.95,
      "keywords": ["word1", "word2"]
    }`,

  // Sentiment Analysis System Prompt
  sentiment_analyzer: `You are an expert in detecting customer sentiment for credit unions.
    Analyze the emotional tone and respond with:
    
    {
      "sentiment": "positive|negative|neutral|frustrated|angry",
      "score": -1.0 to 1.0,
      "explanation": "Brief reason"
    }
    
    Positive indicators: thank, great, satisfied
    Negative indicators: frustrated, angry, disappointed
    Escalation triggers: ALL CAPS, multiple exclamation marks, harsh words`,

  // Response Generation Prompt
  response_generator: `You are a friendly financial assistant for a credit union.
    Respond to customer in their language with:
    - Empathy and clarity
    - Specific details when available
    - Next steps
    - Professional but warm tone
    
    Keep responses under 200 characters.
    Use simple language.
    Avoid jargon.`,

  // Escalation Summary Prompt
  escalation_summarizer: `Create a concise summary for staff escalation:
    
    {
      "issue_category": "string",
      "summary": "2-3 sentence overview",
      "customer_sentiment": "frustrated|angry|neutral|positive",
      "urgency": "low|medium|high",
      "suggested_action": "string",
      "follow_up_questions": ["q1", "q2"]
    }
    
    Make it actionable for a human agent.`,

  // Knowledge Retrieval Prompt
  knowledge_retriever: `You are retrieving from a credit union knowledge base.
    Given a query, find the most relevant section.
    
    Score relevance 0-1.
    Return top 3 matches with:
    {
      "section": "string",
      "relevance": 0.95,
      "content": "excerpt"
    }`
};

// ============ RESOLUTION PROMPTS ============

const RESOLUTION_PROMPTS = {
  // Balance Inquiry Response
  balance_inquiry: `Member asked: "{query}"
    Account balance: ${balance}
    Last transaction: {transaction}
    
    Respond naturally with the balance and offer next steps.
    Example: "Your current {account_type} balance is ${balance}. Is there anything else I can help with?"`,

  // Card Block Response
  card_block: `Member wants to block their card.
    Card type: {card_type}
    Blocking reason: {reason}
    
    Confirm the block and provide timeline:
    "Your {card_type} has been blocked successfully. 
    You'll receive a replacement within 7 business days. 
    A confirmation email has been sent."`,

  // Card Unblock Response
  card_unblock: `Member wants to unblock their card.
    Card type: {card_type}
    Block reason: {original_reason}
    
    Confirm unblock:
    "Your {card_type} is now unblocked. 
    You can use it immediately. 
    Confirmation has been sent to your email."`,

  // Dispute Response (RAG)
  dispute: `Based on our dispute policy:
    
    ${RAG_RETRIEVED_CONTENT}
    
    Member's issue: {dispute_details}
    
    Provide steps and timeline:
    "I understand your concern. Here's our process:
    1. File complaint within 90 days
    2. We investigate for 10-15 days
    3. Refund within 3-5 days if approved
    
    Would you like me to start the process?"`,

  // Loan Status Response (RAG)
  loan_status: `Member asked about their loan application.
    
    From knowledge base:
    ${RAG_RETRIEVED_CONTENT}
    
    Application details: {app_details}
    
    Respond with:
    "Your loan application (ID: {id}) is currently {status}.
    Approval decision expected by {date}.
    ${RAG_CONTENT_SUMMARY}"`,

  // Fee Inquiry Response (RAG)
  fee_inquiry: `Member asking about fees.
    
    Relevant fee information:
    ${RAG_RETRIEVED_CONTENT}
    
    Respond naturally:
    "Here are our fees for {account_type}:
    - Monthly maintenance: ${fee}
    - Overdraft: ${fee}
    - ATM: ${fee}
    
    This matches our published rates."`,

  // Account Update Response
  account_update: `Member wants to update their account.
    Update type: {update_type}
    New value: {new_value}
    
    Confirm and provide steps:
    "You can update your {update_type} by:
    1. Logging into our portal
    2. Go to Account Settings
    3. Edit and save
    
    Changes take effect within 24 hours."`,

  // Complaint Response
  complaint: `Member filed a complaint.
    Complaint type: {complaint_type}
    Sentiment: {sentiment}
    
    Acknowledge and escalate:
    "I understand your concern about {issue}.
    I'm escalating this to our management team.
    They will contact you within {sla} hours.
    Reference number: {case_id}"`,

  // Greeting Response
  greeting: `Friendly greeting response.
    
    "Hello! I'm CreditAssist AI, your financial assistant. 
    I can help with:
    💰 Balance inquiries
    💳 Card management
    ⚠️ Dispute filing
    🏦 Loan information
    📞 And more!
    
    What can I help you with today?"`
};

// ============ RAG PROMPTS ============

const RAG_PROMPTS = {
  // Document Relevance Score
  relevance_scorer: `Rate how relevant this document excerpt is to the query.
    Query: "{query}"
    Document: "{document}"
    
    Return JSON:
    {
      "relevant": true/false,
      "score": 0.95,
      "reason": "Matches {keyword}"
    }`,

  // Content Summarizer
  content_summarizer: `Summarize this policy in 2-3 sentences:
    "{content}"
    
    Make it customer-friendly.
    Highlight key points.
    Keep it concise.`,

  // Answer Generator from RAG
  answer_from_rag: `Using ONLY this information:
    "{rag_content}"
    
    Answer the customer question:
    "{question}"
    
    Rules:
    - Never make up information
    - If not in content, say "I don't have that info"
    - Be conversational
    - Provide next steps`
};

// ============ ESCALATION PROMPTS ============

const ESCALATION_PROMPTS = {
  // Create Escalation Summary
  create_summary: `Create a staff summary for this conversation:
    
    Messages: {messages_array}
    Sentiment: {sentiment}
    Intent: {intent}
    Auto-resolution attempted: {auto_attempt}
    
    Generate JSON:
    {
      "issue": "One sentence description",
      "background": "Why escalation needed",
      "customer_emotion": "Current state",
      "urgency_level": "low|medium|high",
      "suggested_response": "What staff should do next",
      "questions_to_ask": ["q1", "q2", "q3"]
    }`,

  // Priority Assignment
  priority_assigner: `Assign priority level:
    
    Factors:
    - Sentiment: {sentiment}
    - Amount involved: ${amount}
    - Issue type: {type}
    - Previous issues: {history}
    
    Return:
    {
      "priority": "low|medium|high|critical",
      "sla_hours": 24,
      "reasoning": "string"
    }`,

  // Staff Brief
  staff_brief: `Create a 60-second brief for support staff:
    
    Case ID: {case_id}
    Customer: {customer}
    Issue: {issue}
    Messages: {count}
    
    Format:
    📋 Issue: Brief description
    😤 Sentiment: Current emotional state
    ⏱️ Time spent: How long waiting
    💡 Next step: Recommended action
    ⚠️ Caution: Any special notes`
};

// ============ TRAINING PROMPTS ============

const TRAINING_PROMPTS = {
  // Pattern Detection
  pattern_detector: `Analyze these interactions for patterns:
    {interactions_array}
    
    Identify:
    - Common issues
    - Failure points
    - Opportunities for improvement
    
    Return actionable insights.`,

  // Response Quality Feedback
  quality_feedback: `Rate this AI response:
    Question: "{question}"
    Response: "{response}"
    Actual outcome: "{outcome}"
    
    Score 1-10 and suggest improvements.`,

  // Knowledge Base Gaps
  gap_finder: `Identify knowledge gaps from failed interactions:
    
    Escalated cases: {cases}
    
    Return:
    {
      "missing_information": ["topic1", "topic2"],
      "new_doc_needed": "Suggested title",
      "priority": "high|medium|low"
    }`
};

// ============ MULTILINGUAL PROMPTS ============

const LANGUAGE_PROMPTS = {
  hindi: `You are a financial AI assistant.
    Respond in Hindi (हिंदी).
    Use formal language.
    Keep culturally appropriate.`,

  kannada: `You are a financial AI assistant.
    Respond in Kannada (ಕನ್ನಡ).
    Use formal language.
    Keep culturally appropriate.`,

  english: `You are a financial AI assistant.
    Respond in English.
    Use professional but friendly tone.`
};

// ============ EXPORT ============

module.exports = {
  SYSTEM_PROMPTS,
  RESOLUTION_PROMPTS,
  RAG_PROMPTS,
  ESCALATION_PROMPTS,
  TRAINING_PROMPTS,
  LANGUAGE_PROMPTS
};

/**
 * Usage Examples:
 * 
 * 1. Intent Classification:
 *    const prompt = SYSTEM_PROMPTS.intent_classifier;
 *    const result = await classify(prompt, userMessage);
 * 
 * 2. Generate Response:
 *    const prompt = RESOLUTION_PROMPTS.balance_inquiry
 *      .replace('${balance}', balance)
 *      .replace('{account_type}', accountType);
 *    const response = await generate(prompt);
 * 
 * 3. Escalate with Summary:
 *    const prompt = ESCALATION_PROMPTS.create_summary;
 *    const summary = await generate(prompt);
 *    await createCase(summary);
 * 
 * 4. Multilingual:
 *    const systemPrompt = LANGUAGE_PROMPTS[language];
 *    const response = await generate(systemPrompt + contentPrompt);
 */
