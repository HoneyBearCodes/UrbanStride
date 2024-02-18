import { unlink, existsSync } from 'fs';

import { warn } from './logger.js';

/**
 * Remove a file from the file system if it exists.
 *
 * @param {string} filePath - The path of the file to be removed.
 * @throws {Error} Throws an error if the file removal fails.
 */
export const removeFile = (filePath: string): void => {
  // Check if the file exists before attempting to remove it
  if (existsSync(filePath)) {
    unlink(filePath, (err) => {
      if (err) {
        throw err;
      }
    });
  } else {
    warn(`File does not exist at path: ${filePath}`);
  }
};

/**
 * Normalize a file path for cross-platform compatibility.
 *
 * @param {string} filePath - The file path to be normalized.
 * @returns {string[]} An array representing the normalized path segments.
 */
export const normalizeDBFilePath = (filePath: string): string[] => {
  // Since imageUrl is stored as '/product_images/<img_name>', this will
  // normalize it so that the code can also run file operations on other OS
  // without any errors
  return filePath.split('/').slice(1);
};
