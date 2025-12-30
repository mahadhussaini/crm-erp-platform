#!/usr/bin/env node

/**
 * Test script for OpenAI API endpoints
 * Usage: node test-ai-apis.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    console.log(`\n📡 ${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    return { success: response.ok, data };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing OpenAI API endpoints...\n');

  // Test health check
  await testAPI('/api/ai/health');

  // Test chat completion (simple test)
  await testAPI('/api/ai/chat', 'POST', {
    messages: [
      { role: 'user', content: 'Hello, can you help me?' }
    ],
    options: {
      max_tokens: 50
    }
  });

  // Test text generation
  await testAPI('/api/ai/generate', 'POST', {
    prompt: 'Write a short poem about coding',
    options: {
      max_tokens: 100
    }
  });

  // Test summarization
  await testAPI('/api/ai/summarize', 'POST', {
    text: 'This is a long text that needs to be summarized. It contains multiple sentences and explains various concepts about artificial intelligence and machine learning.',
    maxLength: 50
  });

  // Test image generation
  await testAPI('/api/ai/image', 'POST', {
    prompt: 'A beautiful sunset over mountains',
    size: '512x512'
  });

  console.log('\n✨ Testing complete!');
  console.log('Note: Some tests may fail if OpenAI API key is not configured.');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };
