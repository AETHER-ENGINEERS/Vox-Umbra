/**
 * Vox Umbra Framework — Personality Delegation System
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Delegation allows personality bots to request complex tasks from OMARG Agent (Qi OS).
 * Tasks handled by OMARG: web search, image generation, voice synthesis, Linux commands, etc.
 */

const { writeMemory, loadMemories } = require('./memory/writer');
const { safeWriteFile, safeReadFile } = require('./utils/safe-file');

/**
 * Delegation Types
 */
const DELEGATION_TYPES = {
  WEB_SEARCH: 'web_search',
  IMAGE_GENERATION: 'image_generation',
  IMAGE_SAVE: 'image_save',
  IMAGE_ANALYSIS: 'image_analysis',
  VOICE_SYNTHESIS: 'voice_synthesis',
  VOICE_LOAD: 'voice_load',
  LINUX_COMMAND: 'linux_command',
  PYTHON_EXEC: 'python_exec',
  FILE_WRITE: 'file_write',
  FILE_READ: 'file_read',
  CALENDAR_CHECK: 'calendar_check',
  EMAIL_CHECK: 'email_check',
  WEATHER_CHECK: 'weather_check'
};

/**
 * Send delegation request to OMARG Agent (Qi OS)
 * Returns: { success, result, error }
 */
async function delegate(personality, type, payload) {
  console.log(`📤 [${personality}] Delegating: ${type}`);
  
  // Build delegation request
  const request = {
    personality,
    type,
    timestamp: Date.now(),
    payload,
    requestId: generateRequestId()
  };
  
  // In production, this would send to OMARG Agent via Discord DM or API
  // For now: log and return mock response (replace with actual implementation)
  console.log('📝 Delegation request:', JSON.stringify(request, null, 2));
  
  try {
    // Mock delegation response (replace with real OMARG API call)
    const response = await simulateDelegation(request);
    
    // Save delegation as memory for traceability
    writeMemory(personality, {
      type: 'event',
      content: `Delegation: ${type} - ${JSON.stringify(payload)}`,
      significance: 'high',
      tags: ['delegation', type],
      context: {
        delegation_request_id: request.requestId,
        timestamp: request.timestamp
      }
    });
    
    return response;
    
  } catch (error) {
    console.error(`❌ Delegation failed:`, error.message);
    return {
      success: false,
      error: error.message,
      requestId: request.requestId
    };
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Simulate delegation (replace with real OMARG API)
 */
async function simulateDelegation(request) {
  // Mock responses for different types
  const responses = {
    [DELEGATION_TYPES.WEB_SEARCH]: {
      success: true,
      result: {
        summary: 'Mock web search result - replace with real OMARG API call',
        sources: [],
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.IMAGE_GENERATION]: {
      success: true,
      result: {
        image_url: 'https://example.com/mock-image.png',
        prompt: request.payload.prompt,
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.IMAGE_SAVE]: {
      success: true,
      result: {
        saved: true,
        path: `data/images/${request.requestId}.png`,
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.VOICE_SYNTHESIS]: {
      success: true,
      result: {
        voice_url: 'https://example.com/mock-voice.mp3',
        voice_model: 'elevenlabs/nova',
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.LINUX_COMMAND]: {
      success: true,
      result: {
        output: 'Mock Linux command output',
        exitCode: 0,
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.PYTHON_EXEC]: {
      success: true,
      result: {
        output: 'Mock Python execution output',
        exitCode: 0,
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.CALENDAR_CHECK]: {
      success: true,
      result: {
        events: [],
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.EMAIL_CHECK]: {
      success: true,
      result: {
        unread: 0,
        latest: null,
        timestamp: Date.now()
      }
    },
    [DELEGATION_TYPES.WEATHER_CHECK]: {
      success: true,
      result: {
        location: 'Default',
        temp: 72,
        condition: 'Clear',
        timestamp: Date.now()
      }
    }
  };
  
  // Return mock response or error
  if (responses[request.type]) {
    return responses[request.type];
  }
  
  return {
    success: false,
    error: `Unknown delegation type: ${request.type}`,
    requestId: request.requestId
  };
}

/**
 * Save favorite image (personality-specific)
 */
async function saveFavoriteImage(personality, imageUrl, prompt) {
  const result = await delegate(personality, DELEGATION_TYPES.IMAGE_SAVE, {
    image_url: imageUrl,
    prompt: prompt,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Generate image using OMARG
 */
async function generateImage(personality, prompt, style = 'thelema') {
  const result = await delegate(personality, DELEGATION_TYPES.IMAGE_GENERATION, {
    prompt,
    style,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Search web using OMARG
 */
async function webSearch(personality, query, source = 'web') {
  const result = await delegate(personality, DELEGATION_TYPES.WEB_SEARCH, {
    query,
    source,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Execute Linux command using OMARG
 */
async function linuxCommand(personality, command, cwd = null) {
  const result = await delegate(personality, DELEGATION_TYPES.LINUX_COMMAND, {
    command,
    cwd,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Execute Python code using OMARG
 */
async function pythonExec(personality, code, packages = []) {
  const result = await delegate(personality, DELEGATION_TYPES.PYTHON_EXEC, {
    code,
    packages,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Check calendar using OMARG
 */
async function checkCalendar(personality, days = 7) {
  const result = await delegate(personality, DELEGATION_TYPES.CALENDAR_CHECK, {
    days,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Check emails using OMARG
 */
async function checkEmails(personality, limit = 5) {
  const result = await delegate(personality, DELEGATION_TYPES.EMAIL_CHECK, {
    limit,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Check weather using OMARG
 */
async function checkWeather(personality, location = null) {
  const result = await delegate(personality, DELEGATION_TYPES.WEATHER_CHECK, {
    location,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Export public API
 */
module.exports = {
  DELEGATION_TYPES,
  delegate,
  saveFavoriteImage,
  generateImage,
  webSearch,
  linuxCommand,
  pythonExec,
  checkCalendar,
  checkEmails,
  checkWeather
};
