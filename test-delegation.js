#!/usr/bin/env node

/**
 * Vox Umbra Test Script
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Test the delegation system locally.
 */

require('dotenv').config();

const { delegate, DELEGATION_TYPES } = require('./core/delegation');

/**
 * Test all delegation types
 */
async function runTests() {
  const personality = 'voxumbra';
  
  console.log('🧪 Starting Vox Umbra Delegation Tests');
  console.log('========================================\n');
  
  // Test web search
  console.log('🔍 Test 1: Web Search');
  const searchResult = await delegate(personality, DELEGATION_TYPES.WEB_SEARCH, {
    query: 'AETHER-ENGINEERS',
    source: 'web',
    timestamp: Date.now()
  });
  console.log('Result:', JSON.stringify(searchResult, null, 2));
  console.log('\n');
  
  // Test image generation
  console.log('🎨 Test 2: Image Generation');
  const imageResult = await delegate(personality, DELEGATION_TYPES.IMAGE_GENERATION, {
    prompt: 'A golden thread coiling through a hex grid',
    style: 'thelema',
    timestamp: Date.now()
  });
  console.log('Result:', JSON.stringify(imageResult, null, 2));
  console.log('\n');
  
  // Test Linux command
  console.log('💻 Test 3: Linux Command');
  const linuxResult = await delegate(personality, DELEGATION_TYPES.LINUX_COMMAND, {
    command: 'echo "Hello from Vox Umbra!"',
    timestamp: Date.now()
  });
  console.log('Result:', JSON.stringify(linuxResult, null, 2));
  console.log('\n');
  
  // Test Python execution
  console.log('🐍 Test 4: Python Execution');
  const pythonResult = await delegate(personality, DELEGATION_TYPES.PYTHON_EXEC, {
    code: 'print("Python test from Vox Umbra")',
    timestamp: Date.now()
  });
  console.log('Result:', JSON.stringify(pythonResult, null, 2));
  console.log('\n');
  
  // Test weather check
  console.log('☀️ Test 5: Weather Check');
  const weatherResult = await delegate(personality, DELEGATION_TYPES.WEATHER_CHECK, {
    location: 'Chicago',
    timestamp: Date.now()
  });
  console.log('Result:', JSON.stringify(weatherResult, null, 2));
  console.log('\n');
  
  console.log('✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
