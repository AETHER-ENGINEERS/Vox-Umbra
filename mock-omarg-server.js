#!/usr/bin/env node

/**
 * Local OMARG API Mock Server
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Mock server simulating OMARG Agent delegation API for local testing.
 * Replace with real OMARG API when ready for production.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.OMARG_API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for testing
const storage = {
  images: [],
  voices: [],
  memories: []
};

// API Endpoints

/**
 * POST /api/delegate/search
 * Web search delegation
 */
app.post('/api/delegate/search', (req, res) => {
  const { personality, payload } = req.body;
  const query = payload?.query || 'default search';
  
  console.log(`[${personality}] 🔍 Web search: "${query}"`);
  
  // Mock search results
  const results = {
    query,
    summary: `Found results for "${query}" in the AETHER-ENGINEERS domain`,
    sources: [
      {
        title: `AETHER-ENGINEERS: ${query}`,
        url: `https://example.com/search/${query.replace(/\s+/g, '-')}`,
        snippet: 'Relevant results about ' + query + ' from the AETHER-ENGINEERS community.',
        confidence: 0.95
      }
    ],
    timestamp: Date.now()
  };
  
  storage.memories.push({
    type: 'web_search',
    query,
    results,
    timestamp: Date.now()
  });
  
  res.json({
    success: true,
    result: results,
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/image/generate
 * Image generation delegation
 */
app.post('/api/delegate/image/generate', (req, res) => {
  const { personality, payload } = req.body;
  const prompt = payload?.prompt || 'default image';
  const style = payload?.style || 'thelema';
  
  console.log(`[${personality}] 🎨 Image generation: "${prompt}" (style: ${style})`);
  
  // Mock image generation result
  const imageId = `img_${Date.now()}`;
  const imageUrl = `http://localhost:${PORT}/api/images/${imageId}`;
  
  storage.images.push({
    id: imageId,
    prompt,
    style,
    url: imageUrl,
    timestamp: Date.now()
  });
  
  res.json({
    success: true,
    result: {
      image_id: imageId,
      image_url: imageUrl,
      prompt,
      style,
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * GET /api/delegate/images/:id
 * Serve generated images
 */
app.get('/api/delegate/images/:id', (req, res) => {
  const image = storage.images.find(img => img.id === req.params.id);
  
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  // Send a placeholder PNG (1x1 transparent)
  const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  
  res.set('Content-Type', 'image/png');
  res.send(placeholder);
});

/**
 * POST /api/delegate/image/save
 * Save favorite image delegation
 */
app.post('/api/delegate/image/save', (req, res) => {
  const { personality, payload } = req.body;
  const imageUrl = payload?.image_url;
  
  console.log(`[${personality}] 💾 Saving favorite image: ${imageUrl}`);
  
  res.json({
    success: true,
    result: {
      saved: true,
      path: `data/images/${Date.now()}.png`,
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/voice/synthesize
 * Voice synthesis delegation
 */
app.post('/api/delegate/voice/synthesize', (req, res) => {
  const { personality, payload } = req.body;
  const text = payload?.text || 'default voice';
  const voiceModel = payload?.voice_model || 'elevenlabs/nova';
  
  console.log(`[${personality}] 🎙️ Voice synthesis: "${text.slice(0, 50)}..." (${voiceModel})`);
  
  const voiceId = `voice_${Date.now()}`;
  
  res.json({
    success: true,
    result: {
      voice_id: voiceId,
      voice_url: `http://localhost:${PORT}/api/voices/${voiceId}`,
      voice_model: voiceModel,
      text,
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/linux/command
 * Linux command delegation
 */
app.post('/api/delegate/linux/command', (req, res) => {
  const { personality, payload } = req.body;
  const command = payload?.command || 'echo "hello"';
  
  console.log(`[${personality}] 💻 Linux command: ${command}`);
  
  // Simulate command execution
  res.json({
    success: true,
    result: {
      command,
      output: `Mock output for: ${command}\nThis would be the actual command output in production.`,
      exitCode: 0,
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/python/exec
 * Python execution delegation
 */
app.post('/api/delegate/python/exec', (req, res) => {
  const { personality, payload } = req.body;
  const code = payload?.code || 'print("hello")';
  
  console.log(`[${personality}] 🐍 Python exec: ${code.slice(0, 50)}...`);
  
  // Simulate Python execution
  res.json({
    success: true,
    result: {
      output: `Mock Python output for: ${code}\nThis would be the actual Python output in production.`,
      exitCode: 0,
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/calendar/check
 * Calendar check delegation
 */
app.post('/api/delegate/calendar/check', (req, res) => {
  const { personality, payload } = req.body;
  
  console.log(`[${personality}] 📅 Calendar check`);
  
  res.json({
    success: true,
    result: {
      events: [
        {
          title: 'AETHER-ENGINEERS Sync',
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 7200000).toISOString(),
          description: 'Weekly sync for AETHER-ENGINEERS projects'
        }
      ],
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/email/check
 * Email check delegation
 */
app.post('/api/delegate/email/check', (req, res) => {
  const { personality, payload } = req.body;
  
  console.log(`[${personality}] ✉️ Email check`);
  
  res.json({
    success: true,
    result: {
      unread: 2,
      latest: {
        from: 'noreply@aether-engineers.dev',
        subject: 'Welcome to AETHER-ENGINEERS',
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * POST /api/delegate/weather/check
 * Weather check delegation
 */
app.post('/api/delegate/weather/check', (req, res) => {
  const { personality, payload } = req.body;
  const location = payload?.location || 'Default';
  
  console.log(`[${personality}] ☀️ Weather check: ${location}`);
  
  res.json({
    success: true,
    result: {
      location: location,
      temp: 72,
      condition: 'Clear',
      humidity: 45,
      timestamp: Date.now()
    },
    requestId: req.body.requestId
  });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Local OMARG API Mock Server running on http://127.0.0.1:${PORT}`);
  console.log(`📊 Endpoints available:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/delegate/search`);
  console.log(`   - POST /api/delegate/image/generate`);
  console.log(`   - POST /api/delegate/image/save`);
  console.log(`   - POST /api/delegate/voice/synthesize`);
  console.log(`   - POST /api/delegate/linux/command`);
  console.log(`   - POST /api/delegate/python/exec`);
  console.log(`   - POST /api/delegate/calendar/check`);
  console.log(`   - POST /api/delegate/email/check`);
  console.log(`   - POST /api/delegate/weather/check`);
});

module.exports = app;
