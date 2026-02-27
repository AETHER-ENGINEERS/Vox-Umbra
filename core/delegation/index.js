/**
 * Vox Umbra Framework — Personality Delegation System
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Delegation allows personality bots to request complex tasks from OMARG Agent (Qi OS).
 * Tasks handled by OMARG: web search, image generation, voice synthesis, Linux commands, etc.
 * 
 * CONFIGURATION-DRIVEN:
 * - Delegation logic is defined in personality configs
 * - Each task type can have custom parameters
 * - Supports API endpoints, local commands, or hybrid approaches
 */

const { writeMemory } = require('./memory/writer');
const { safeWriteFile } = require('./utils/safe-file');
const fs = require('fs');
const path = require('path');

/**
 * Load personality delegation configuration
 */
function loadPersonalityConfig(personality) {
  const configPath = path.join(__dirname, '..', '..', 'personalities', personality, 'config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error(`❌ Failed to load personality config: ${personality}`, e.message);
  }
  
  // Return default config if not found
  return {
    delegation: {
      enabled: true,
      omarg_api_url: 'http://localhost:3000/api/delegate',
      timeout: 30000
    },
    tasks: {
      web_search: {
        type: 'api',
        endpoint: '/search',
        params: { source: 'web', limit: 10 }
      },
      image_generation: {
        type: 'api',
        endpoint: '/image/generate',
        params: { model: 'stable-diffusion-xl', style: 'thelema' }
      },
      image_save: {
        type: 'local',
        command: 'cp',
        output_dir: 'data/images'
      },
      voice_synthesis: {
        type: 'api',
        endpoint: '/voice/synthesize',
        params: { voice_model: 'elevenlabs/nova' }
      },
      linux_command: {
        type: 'local',
        command: 'bash',
        args: ['-c']
      },
      python_exec: {
        type: 'local',
        command: 'python3',
        args: ['-c']
      },
      calendar_check: {
        type: 'api',
        endpoint: '/calendar/events',
        params: { days: 7 }
      },
      email_check: {
        type: 'api',
        endpoint: '/email/unread',
        params: { limit: 5 }
      },
      weather_check: {
        type: 'api',
        endpoint: '/weather/current',
        params: { units: 'imperial' }
      }
    }
  };
}

/**
 * Build delegation request
 */
function buildRequest(personality, type, payload) {
  return {
    personality,
    type,
    timestamp: Date.now(),
    payload,
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  };
}

/**
 * Execute API delegation to OMARG Agent
 * Returns: { success, result, error }
 */
async function executeApiDelegation(request, config, taskConfig) {
  const { omarg_api_url, timeout } = config.delegation;
  const { endpoint, params = {} } = taskConfig;
  
  const url = `${omarg_api_url}${endpoint}`;
  const body = {
    ...request,
    params: { ...params, ...request.payload }
  };
  
  console.log(`📡 API delegation to: ${url}`);
  console.log(`📊 Request body:`, JSON.stringify(body, null, 2));
  
  try {
    // Real API call to OMARG Agent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OMARG_API_TOKEN || ''}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ API delegation successful:`, result);
    
    return {
      success: true,
      result,
      requestId: request.requestId
    };
    
  } catch (error) {
    console.error(`❌ API delegation failed:`, error.message);
    
    // Fallback: if API unavailable, try local processing
    if (taskConfig.type === 'local' || error.message.includes('ECONNREFUSED')) {
      console.log(`🔧 Attempting local fallback for: ${type}`);
      return executeLocalDelegation(request, config, taskConfig);
    }
    
    return {
      success: false,
      error: error.message,
      requestId: request.requestId
    };
  }
}

/**
 * Execute local command delegation
 * Returns: { success, result, error }
 */
async function executeLocalDelegation(request, config, taskConfig) {
  const { command, args = [] } = taskConfig;
  const { payload } = request;
  
  // Handle different command types
  let commandToRun = command;
  let commandArgs = [...args, payload.command || payload.code || ''];
  
  // Special case: python_exec needs code in a temp file
  if (command === 'python3' && payload.code) {
    const fs = require('fs');
    const tempFile = `/tmp/voxumbra_${request.requestId}.py`;
    
    // Sanitize code (basic protection)
    const safeCode = payload.code.replace(/;.*process\.|.*eval\(|.*require\(|.*fs\.|.*child_process/g, '');
    
    fs.writeFileSync(tempFile, safeCode);
    commandArgs = ['-c', safeCode];
  }
  
  console.log(`💻 Local command: ${commandToRun} ${commandArgs.join(' ')}`);
  
  try {
    const { exec } = require('child_process');
    
    const promise = new Promise((resolve, reject) => {
      const child = exec(commandToRun + ' ' + commandArgs.join(' '), {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10  // 10MB buffer
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', data => {
        stdout += data.toString();
        console.log(`stdout: ${data}`);
      });
      
      child.stderr.on('data', data => {
        stderr += data.toString();
        console.error(`stderr: ${data}`);
      });
      
      child.on('close', code => {
        if (code === 0) {
          resolve({ output: stdout, exitCode: code });
        } else {
          reject(new Error(`Command exited with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', error => {
        reject(error);
      });
    });
    
    const { output, exitCode } = await promise;
    
    // Clean up temp file if created
    const tempFile = `/tmp/voxumbra_${request.requestId}.py`;
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    console.log(`✅ Local command successful:`, { output: output.slice(0, 500), exitCode });
    
    return {
      success: true,
      result: {
        command: commandToRun,
        args: commandArgs,
        output: output,
        exitCode,
        timestamp: Date.now()
      },
      requestId: request.requestId
    };
    
  } catch (error) {
    console.error(`❌ Local command failed:`, error.message);
    
    // Clean up temp file on error
    const tempFile = `/tmp/voxumbra_${request.requestId}.py`;
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return {
      success: false,
      error: error.message,
      requestId: request.requestId
    };
  }
}

/**
 * Execute delegation based on personality config
 * Returns: { success, result, error }
 */
async function delegate(personality, type, payload) {
  console.log(`📤 [${personality}] Delegating: ${type}`);
  
  const request = buildRequest(personality, type, payload);
  
  // Load personality config
  const config = loadPersonalityConfig(personality);
  
  if (!config.delegation.enabled) {
    return {
      success: false,
      error: `Delegation disabled for personality: ${personality}`,
      requestId: request.requestId
    };
  }
  
  const taskConfig = config.tasks[type];
  
  if (!taskConfig) {
    return {
      success: false,
      error: `Unknown task type: ${type}`,
      requestId: request.requestId
    };
  }
  
  try {
    // Execute based on task type
    if (taskConfig.type === 'api') {
      const result = await executeApiDelegation(request, config, taskConfig);
      
      // Save delegation as memory for traceability
      writeMemory(personality, {
        type: 'event',
        content: `Delegation: ${type} - ${JSON.stringify(payload)}`,
        significance: 'high',
        tags: ['delegation', type],
        context: {
          delegation_request_id: request.requestId,
          timestamp: request.timestamp,
          result: result.success ? 'success' : 'failed'
        }
      });
      
      return result;
      
    } else if (taskConfig.type === 'local') {
      const result = await executeLocalDelegation(request, config, taskConfig);
      
      // Save delegation as memory for traceability
      writeMemory(personality, {
        type: 'event',
        content: `Delegation: ${type} - ${JSON.stringify(payload)}`,
        significance: 'high',
        tags: ['delegation', type, 'local'],
        context: {
          delegation_request_id: request.requestId,
          timestamp: request.timestamp,
          result: result.success ? 'success' : 'failed'
        }
      });
      
      return result;
      
    } else {
      return {
        success: false,
        error: `Unknown delegation type: ${taskConfig.type}`,
        requestId: request.requestId
      };
    }
    
  } catch (error) {
    console.error(`❌ Delegation failed:`, error.message);
    
    // Save failure as memory
    writeMemory(personality, {
      type: 'event',
      content: `Delegation failed: ${type} - ${error.message}`,
      significance: 'critical',
      tags: ['delegation', type, 'error'],
      context: {
        delegation_request_id: request.requestId,
        timestamp: request.timestamp,
        error: error.message
      }
    });
    
    return {
      success: false,
      error: error.message,
      requestId: request.requestId
    };
  }
}

/**
 * Save favorite image (personality-specific)
 */
async function saveFavoriteImage(personality, imageUrl, prompt) {
  const result = await delegate(personality, 'image_save', {
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
  const result = await delegate(personality, 'image_generation', {
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
  const result = await delegate(personality, 'web_search', {
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
  const result = await delegate(personality, 'linux_command', {
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
  const result = await delegate(personality, 'python_exec', {
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
  const result = await delegate(personality, 'calendar_check', {
    days,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Check emails using OMARG
 */
async function checkEmails(personality, limit = 5) {
  const result = await delegate(personality, 'email_check', {
    limit,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Check weather using OMARG
 */
async function checkWeather(personality, location = null) {
  const result = await delegate(personality, 'weather_check', {
    location,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Export public API
 */
module.exports = {
  DELEGATION_TYPES: {
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
  },
  delegate,
  saveFavoriteImage,
  generateImage,
  webSearch,
  linuxCommand,
  pythonExec,
  checkCalendar,
  checkEmails,
  checkWeather,
  loadPersonalityConfig,
  buildRequest,
  executeApiDelegation,
  executeLocalDelegation
};
