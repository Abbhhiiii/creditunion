/**
 * RAG Engine - Retrieval Augmented Generation
 * Vector-based retrieval from knowledge base
 */

const fs = require('fs');
const path = require('path');

class RAGEngine {
  constructor() {
    this.documents = [];
    this.embeddings = new Map(); // Simple in-memory storage
    this.loadDocuments();
  }

  /**
   * Load all knowledge base documents
   */
  loadDocuments() {
    const kbPath = path.join(__dirname, '../../knowledge-base');
    const files = fs.readdirSync(kbPath);
    
    files.forEach(file => {
      if (file.endsWith('.txt')) {
        const filePath = path.join(kbPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const chunks = this.chunkDocument(content, file);
        
        chunks.forEach(chunk => {
          this.documents.push({
            id: `${file}-${this.documents.length}`,
            filename: file,
            content: chunk,
            keywords: this.extractKeywords(chunk)
          });
        });
      }
    });
    
    console.log(`✓ Loaded ${this.documents.length} document chunks into RAG`);
  }

  /**
   * Split document into chunks for retrieval
   */
  chunkDocument(content, filename) {
    // Split on numbered section headers like "\n1. TITLE" or "\n12. TITLE"
    // Also supports blank-line separated sections.
    const normalized = content.replace(/\r\n/g, '\n');
    let sections = normalized.split(/\n(?=\d{1,2}\.\s+[A-Z])/);
    if (sections.length < 2) {
      sections = normalized.split(/\n\s*\n/);
    }
    return sections
      .map(s => s.trim())
      .filter(s => s.length > 40);
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'is', 'are', 'was', 'be', 'been', 'being', 'have', 'has', 'had'
    ]);
    
    return words.filter(w => !stopwords.has(w) && w.length > 3);
  }

  /**
   * Retrieve relevant documents based on query
   */
  async retrieve(query, intent, topK = 3) {
    const queryKeywords = this.extractKeywords(query);
    const scores = [];
    
    // Calculate relevance scores
    this.documents.forEach(doc => {
      let score = 0;
      
      // Keyword matching
      queryKeywords.forEach(kw => {
        doc.keywords.forEach(dk => {
          if (kw === dk || this.similarityScore(kw, dk) > 0.8) {
            score += 1;
          }
        });
      });
      
      // Content matching
      if (doc.content.toLowerCase().includes(intent.type)) {
        score += 2;
      }
      
      // Intent-specific matching
      const intentKeywords = {
        'balance_inquiry': ['balance', 'account', 'savings'],
        'loan_status': ['loan', 'application', 'approval'],
        'card_block': ['card', 'block', 'freeze'],
        'dispute': ['dispute', 'unauthorized', 'transaction'],
        'interest_rate': ['interest', 'rate', 'apy'],
        'fee_inquiry': ['fee', 'charge', 'cost']
      };
      
      if (intentKeywords[intent.type]) {
        intentKeywords[intent.type].forEach(kw => {
          if (doc.content.toLowerCase().includes(kw)) {
            score += 1.5;
          }
        });
      }
      
      if (score > 0) {
        scores.push({
          ...doc,
          relevance_score: score
        });
      }
    });
    
    // Sort by score and return top K
    return scores
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, topK)
      .map(doc => ({
        content: doc.content,
        source: doc.filename,
        relevance_score: doc.relevance_score
      }));
  }

  /**
   * Simple string similarity (Levenshtein-like)
   */
  similarityScore(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance (simplified)
   */
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[len2][len1];
  }
}

module.exports = { RAGEngine };
