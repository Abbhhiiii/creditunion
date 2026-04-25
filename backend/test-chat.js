/**
 * Test script for chat API
 */
const http = require('http');
const jwt = require('jsonwebtoken');

// Generate a valid token
const token = jwt.sign(
  { id: 'test-user', email: 'test@example.com' },
  'creditassist-local-dev-key-super-secret-change-in-prod',
  { expiresIn: '24h' }
);

console.log('Generated token:', token);

const chatData = JSON.stringify({
  message: 'What is my account balance?',
  conversation_id: 'test-conv-123',
  language: 'en'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat/message',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(chatData),
    'Authorization': `Bearer ${token}`
  }
};

console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Data:', chatData);

const req = http.request(options, (res) => {
  let data = '';

  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(chatData);
req.end();
