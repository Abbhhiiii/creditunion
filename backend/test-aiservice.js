/**
 * Direct test of aiService without HTTP
 */
const { getAIService } = require('./services/aiService');

async function test() {
  try {
    console.log('Testing aiService directly...');
    const aiService = getAIService();
    
    const response = await aiService.processMessage(
      'What is my balance?',
      'test-conv-123',
      'test-user-123'
    );
    
    console.log('Response:', response);
    console.log('Stringified:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
