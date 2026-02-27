/**
 * Vox Umbra Framework — Safe File Utilities
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Safe wrappers around fs operations with error handling.
 */

const fs = require('fs');
const path = require('path');

/**
 * Safe directory creation with error handling
 */
function safeMkdir(dirPath, options = { recursive: true }) {
  try {
    fs.mkdirSync(dirPath, options);
    return { success: true, path: dirPath };
  } catch (error) {
    console.error(`❌ Failed to create directory: ${dirPath}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * Safe file write with error handling
 */
function safeWriteFile(filePath, data, options = { encoding: 'utf8' }) {
  try {
    fs.writeFileSync(filePath, data, options);
    return { success: true, path: filePath };
  } catch (error) {
    console.error(`❌ Failed to write file: ${filePath}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * Safe file read with error handling
 */
function safeReadFile(filePath, options = { encoding: 'utf8' }) {
  try {
    const data = fs.readFileSync(filePath, options);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to read file: ${filePath}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error, data: null };
  }
}

/**
 * Safe file existence check
 */
function safeExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(`❌ Failed to check file existence: ${filePath}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Safe directory listing
 */
function safe.readdir(dirPath) {
  try {
    return fs.readdirSync(dirPath);
  } catch (error) {
    console.error(`❌ Failed to read directory: ${dirPath}`);
    console.error(`   Error: ${error.message}`);
    return [];
  }
}

/**
 * Export safe file utilities
 */
module.exports = {
  safeMkdir,
  safeWriteFile,
  safeReadFile,
  safeExists,
  safe: {
    mkdir: safeMkdir,
    writeFile: safeWriteFile,
    readFile: safeReadFile,
    exists: safeExists,
    readdir: safe.readdir
  }
};
