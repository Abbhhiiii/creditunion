/**
 * Sentiment Analyzer - Advanced Emotion Detection
 * Uses NLP-based semantic analysis + context
 */

const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const PorterStemmer = natural.PorterStemmer;

// Sentiment vocabulary with weights
const sentimentLexicon = {
  positive: {
    strong: ['excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'great'],
    moderate: ['good', 'happy', 'pleased', 'satisfied', 'thanks', 'helpful', 'quick'],
    mild: ['okay', 'fine', 'nice', 'decent', 'sure']
  },
  negative: {
    strong: ['terrible', 'awful', 'horrible', 'disgusting', 'hate', 'worst', 'furious'],
    moderate: ['bad', 'angry', 'frustrated', 'disappointed', 'upset', 'problem', 'issue'],
    mild: ['not', 'don\'t', 'didn\'t', 'won\'t', 'can\'t', 'no']
  },
  intensifiers: ['very', 'extremely', 'absolutely', 'completely', 'totally', 'so', 'really'],
  negators: ['not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere']
};

const sentimentAnalyzer = {
  /**
   * Analyze sentiment with context and intensity
   */
  analyze(message) {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const cleanMessage = message.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;
    let intensityMultiplier = 1;
    let contextMultiplier = 1;
    
    // Check for all-caps (emotional intensity)
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.3) intensityMultiplier = 1.5;
    
    // Check for exclamation marks (intensity)
    const exclamationCount = (message.match(/!/g) || []).length;
    intensityMultiplier += exclamationCount * 0.3;
    
    // Check for question marks (uncertainty/concern)
    const questionCount = (message.match(/\?/g) || []).length;
    if (questionCount > 1) contextMultiplier = 0.8;
    
    // Score tokens with context awareness
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const stemmed = PorterStemmer.stem(token);
      
      // Check for intensifiers before sentiment words
      let tokenIntensity = 1;
      if (i > 0 && sentimentLexicon.intensifiers.includes(tokens[i-1])) {
        tokenIntensity = 1.8;
      }
      
      // Check for negators before sentiment words
      let isNegated = false;
      if (i > 0 && sentimentLexicon.negators.includes(tokens[i-1])) {
        isNegated = true;
      }
      
      // Score positive words
      for (const strength of Object.keys(sentimentLexicon.positive)) {
        const words = sentimentLexicon.positive[strength];
        const strengthWeight = strength === 'strong' ? 3 : strength === 'moderate' ? 2 : 1;
        
        if (words.includes(token) || words.includes(stemmed)) {
          if (isNegated) {
            negativeScore += strengthWeight * tokenIntensity;
          } else {
            positiveScore += strengthWeight * tokenIntensity;
          }
        }
      }
      
      // Score negative words
      for (const strength of Object.keys(sentimentLexicon.negative)) {
        const words = sentimentLexicon.negative[strength];
        const strengthWeight = strength === 'strong' ? 3 : strength === 'moderate' ? 2 : 1;
        
        if (words.includes(token) || words.includes(stemmed)) {
          if (isNegated) {
            positiveScore += strengthWeight * tokenIntensity;
          } else {
            negativeScore += strengthWeight * tokenIntensity;
          }
        }
      }
    }
    
    // Apply multipliers
    positiveScore *= intensityMultiplier * contextMultiplier;
    negativeScore *= intensityMultiplier * contextMultiplier;
    
    // Determine sentiment type with nuance
    let type = 'neutral';
    let score = 0;
    
    if (negativeScore > positiveScore && negativeScore > 1) {
      if (negativeScore >= 9) {
        type = 'angry';
        score = Math.min(negativeScore / 20, 1);
      } else if (negativeScore >= 5) {
        type = 'frustrated';
        score = Math.min(negativeScore / 15, 1);
      } else {
        type = 'negative';
        score = Math.min(negativeScore / 10, 1);
      }
    } else if (positiveScore > negativeScore && positiveScore > 1) {
      if (positiveScore >= 9) {
        type = 'very_positive';
        score = Math.min(positiveScore / 20, 1);
      } else {
        type = 'positive';
        score = Math.min(positiveScore / 10, 1);
      }
    } else {
      score = 0.5;
    }
    
    return {
      type,
      score: Math.min(score, 1),
      positiveScore,
      negativeScore,
      intensityMultiplier,
      requiresUrgentAttention: type === 'angry' || (type === 'frustrated' && negativeScore > 6)
    };
  }
};

module.exports = { sentimentAnalyzer };
    
    // Calculate sentiment score (-1 to 1)
    const totalScore = positiveScore + negativeScore;
    let score = 0;
    if (totalScore > 0) {
      score = (positiveScore - negativeScore) / totalScore;
    }
    
    // Check for escalation indicators
    const allCaps = (message.match(/[A-Z]{2,}/g) || []).length > 3;
    const exclamation = (message.match(/!/g) || []).length > 2;
    if (allCaps || exclamation) {
      score -= 0.2; // Reduce score (more negative)
      if (negativeScore > 0) type = 'angry';
    }
    
    return {
      type,
      score: Math.max(-1, Math.min(1, score)),
      positive_count: positiveScore,
      negative_count: negativeScore,
      requires_escalation: type === 'angry' || type === 'frustrated'
    };
  }
};

module.exports = { sentimentAnalyzer };
