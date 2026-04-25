/**
 * Conversation Memory Manager
 * Maintains conversation history and context for intelligent responses
 */

class ConversationMemory {
  constructor(conversationId, maxMessages = 20) {
    this.conversationId = conversationId;
    this.messages = [];
    this.maxMessages = maxMessages;
    this.metadata = {
      startedAt: new Date(),
      userSentiment: 'neutral',
      primaryIssue: null,
      escalationReasons: [],
      attempts: 0
    };
  }

  addMessage(role, content, metadata = {}) {
    this.messages.push({
      role,
      content,
      timestamp: new Date(),
      ...metadata
    });

    // Keep only recent messages in memory
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    return this;
  }

  getMessages() {
    return this.messages;
  }

  getSummary() {
    return {
      conversationId: this.conversationId,
      messageCount: this.messages.length,
      duration: new Date() - this.metadata.startedAt,
      userSentiment: this.metadata.userSentiment,
      primaryIssue: this.metadata.primaryIssue,
      lastMessage: this.messages[this.messages.length - 1] || null,
      metadata: this.metadata
    };
  }

  getContext() {
    // Format messages for LLM context
    return this.messages
      .map(m => `${m.role.charAt(0).toUpperCase() + m.role.slice(1)}: ${m.content}`)
      .join('\n');
  }

  updateMetadata(updates) {
    this.metadata = { ...this.metadata, ...updates };
    return this;
  }

  clear() {
    this.messages = [];
    return this;
  }
}

module.exports = ConversationMemory;
