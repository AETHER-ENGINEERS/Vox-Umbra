/**
 * Vox Umbra Framework — Memory Writer
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Generic memory writer that uses personality schema to validate and save memories.
 * Personality-specific logic is defined in their schema/config.
 */

const { saveMemory, getPersonalityDir } = require('./store');

/**
 * Validate memory against personality schema
 * Returns { valid, errors }
 */
function validateMemory(personality, memoryData) {
  // Load personality schema if exists
  const schemaPath = `${getPersonalityDir(personality)}/schema.json`;
  
  // Default schema (allows anything if no schema exists)
  const defaultSchema = {
    required: ['content', 'significance'],
    allowedTypes: ['event', 'insight', 'pattern', 'emotion', 'connection', 'custom'],
    allowedSignificances: ['low', 'medium', 'high', 'critical']
  };
  
  let schema = defaultSchema;
  try {
    const fs = require('fs');
    if (fs.existsSync(schemaPath)) {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    }
  } catch (e) {
    // Use default schema
  }
  
  const errors = [];
  
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!memoryData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check type validation
  if (schema.allowedTypes && memoryData.type && !schema.allowedTypes.includes(memoryData.type)) {
    errors.push(`Invalid type: ${memoryData.type}. Allowed: ${schema.allowedTypes.join(', ')}`);
  }
  
  // Check significance validation
  if (schema.allowedSignificances && memoryData.significance && !schema.allowedSignificances.includes(memoryData.significance)) {
    errors.push(`Invalid significance: ${memoryData.significance}. Allowed: ${schema.allowedSignificances.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Write a memory using personality schema
 * Returns memory ID if successful, null otherwise
 */
function writeMemory(personality, memoryData) {
  const validation = validateMemory(personality, memoryData);
  
  if (!validation.valid) {
    console.error(`❌ Memory validation failed for ${personality}:`);
    validation.errors.forEach(err => console.error(`   - ${err}`));
    return null;
  }
  
  // Add timestamp if not present
  if (!memoryData.timestamp) {
    memoryData.timestamp = Date.now();
  }
  
  // Save to storage
  const memoryId = saveMemory(personality, memoryData);
  
  console.log(`💾 Memory saved for ${personality}: ${memoryId}`);
  
  return memoryId;
}

/**
 * Batch write memories (for bulk imports)
 */
function writeMemories(personality, memories) {
  const results = { saved: [], failed: [] };
  
  for (const memory of memories) {
    const id = writeMemory(personality, memory);
    if (id) {
      results.saved.push(id);
    } else {
      results.failed.push(memory);
    }
  }
  
  return results;
}

/**
 * Export public API
 */
module.exports = {
  writeMemory,
  writeMemories,
  validateMemory
};
