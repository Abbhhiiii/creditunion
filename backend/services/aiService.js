/**
 * AI Service - LLM-Powered Conversational Agent
 * Uses open-source Ollama with conversation memory
 */

const { getAgent } = require('./llmAgent');
const { RAGEngine } = require('./ragEngine');

class AIService {
  constructor() {
    this.llmAgent = getAgent();
    this.ragEngine = new RAGEngine();
  }

  /**
   * Main message processing pipeline with LLM
   */
  async processMessage(userMessage, conversationId, userId, metadata = {}) {
    try {
      console.log('[AIService] Processing message:', { userMessage, conversationId, userId });
      
      // Get LLM response with conversation memory and user context
      const llmResponse = await this.llmAgent.processMessage(
        userMessage,
        conversationId,
        userId,
        metadata
      );
      
      console.log('[AIService] LLM Response:', llmResponse);

      // Optionally enhance with RAG (knowledge base retrieval)
      let knowledgeContext = null;
      if (this.shouldUseRAG(llmResponse.intent)) {
        knowledgeContext = await this.ragEngine.retrieve(userMessage, llmResponse.intent);
        // Could enhance response with RAG results if needed
      }

      // Return complete response
      const response = {
        content: llmResponse.content,
        conversationId: conversationId,
        intent: llmResponse.intent,
        sentiment: llmResponse.sentiment,
        confidence: llmResponse.confidence,
        resolution_status: llmResponse.shouldEscalate ? 'escalated' : 'auto-resolved',
        llmModel: llmResponse.llmModel,
        metadata: {
          decision_type: llmResponse.shouldEscalate ? 'escalate' : 'auto-resolve',
          conversation_memory: this.llmAgent.getConversationSummary(conversationId),
          knowledge_context: knowledgeContext,
          escalation_reason: llmResponse.metadata?.escalation_reason,
          escalated: llmResponse.metadata?.escalated
        }
      };
      
      console.log('[AIService] Returning response:', response);
      return response;
    } catch (error) {
      console.error('[AIService] Error processing message:', error);
      console.error('[AIService] Error stack:', error.stack);
      return {
        content: 'I apologize for the technical difficulty. Please try again or contact support.',
        conversationId: conversationId,
        intent: 'error',
        sentiment: 'neutral',
        confidence: 0,
        resolution_status: 'escalated',
        llmModel: 'ollama-mistral',
        metadata: {
          decision_type: 'error',
          conversation_memory: [],
          knowledge_context: null
        },
        error: error.message
      };
    }
  }

  /**
   * Determine if RAG (knowledge retrieval) should be used
   */
  shouldUseRAG(intent) {
    const ragIntents = ['balance', 'loan', 'policy', 'general'];
    return ragIntents.includes(intent);
  }

  /**
   * Get conversation history and context
   */
  getConversationContext(conversationId) {
    return this.llmAgent.getConversationSummary(conversationId);
  }

  /**
   * Clear conversation (for privacy/reset)
   */
  clearConversation(conversationId) {
    this.llmAgent.clearConversation(conversationId);
  }
}

// Singleton instance
let aiServiceInstance = null;

function getAIService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

module.exports = {
  AIService,
  getAIService,
  processMessage: async (...args) => getAIService().processMessage(...args)
};
