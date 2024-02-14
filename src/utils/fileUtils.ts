import { unlink } from 'fs';

/**
 * Remove a file from the file system.
 *
 * @param {string} filePath - The path of the file to be removed.
 * @throws {Error} Throws an error if the file removal fails.
 */
export const removeFile = (filePath: string): void => {
  unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
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
