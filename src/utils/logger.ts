/*
 * Utility file for printing logs
 */

import chalk from 'chalk';

/**
 * Options for the log function.
 * @type {object} LogOptions
 * @property {string} [message] - The message to be logged.
 * @property {Object} [object] - The object to be logged.
 * @property {boolean} [clearConsole] - Whether to clear the console before logging.
 */
interface LogOptions {
  message?: string;
  object?: object;
  clearConsole?: boolean;
}

/**
 * Logs a message or object to the console.
 * @param {LogOptions} options - Options for the log function.
 */
export const log = ({ message, object, clearConsole }: LogOptions) => {
  if (clearConsole) {
    console.clear();
  }
  if (message) {
    console.log(`${chalk.bold.green('[+]')} ${message}`);
  }
  if (object) {
    console.log(
      `${chalk.bold.green('[+]')} Returned Object:\n\n`,
      object,
      '\n',
    );
  }
};

/**
 * Logs a warning message to the console.
 * @param {string} message - The warning message to be logged.
 */
export const warn = (message: string) => {
  console.log(`${chalk.bold.yellow('[+]')} ${message}`);
};

/**
 * Logs an error message to the console.
 * @param {unknown} err - The error message to be logged.
 */
export const error = (err: unknown) => {
  if (err instanceof Error) {
    console.log(`${chalk.bold.red('[+]')} ${err.message}`);
  } else if (typeof error === 'string') {
    console.log(`${chalk.bold.red('[+]')} ${err}`);
  } else throw new Error('error only accepts a string or Error object');
};

export const underline = chalk.underline;
export const bold = chalk.bold;
export const italic = chalk.italic;
