import { readFileSync } from 'fs';
import { join } from 'path';

import { compile } from 'ejs';
import nodemailer from 'nodemailer';
import appRootPath from 'app-root-path';

// Get the root directory of the application
const rootDir = appRootPath.toString();

/**
 * Load an email template from the 'src/emails' directory.
 *
 * @param {string} templateName - The name of the template file (without the extension).
 * @returns {string} The content of the loaded template.
 */
const loadTemplate = (templateName: string): string => {
  // Construct the full path to the template file
  const templatePath = join(rootDir, 'src', 'emails', `${templateName}.ejs`);
  // Read and return the content of the template
  return readFileSync(templatePath, 'utf-8');
};

/**
 * Compile an email template using EJS.
 *
 * @param {string} templateName - The name of the template file (without the extension).
 * @param {Record<string, unknown>} data - The data to be used for template rendering.
 * @returns {string} The compiled HTML content of the email template.
 */
export const compileTemplate = (
  templateName: string,
  data: Record<string, unknown>,
): string => {
  // Load the template content
  const template = loadTemplate(templateName);
  // Compile the template with the provided data
  const compiledTemplate = compile(template);
  // Return the compiled HTML content
  return compiledTemplate(data);
};

/**
 * Nodemailer transporter configuration for sending emails via Gmail.
 */
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});
