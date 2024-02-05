import chalk from 'chalk';
import * as stackTrace from 'stack-trace';

/**
 * Enum representing different log levels.
 */
enum LogLevel {
  Log = 'log',
  Warn = 'warn',
  Error = 'error',
}

/**
 * Logs a message or object to the console based on the specified log level.
 *
 * @param {LogLevel} level - The log level (Log, Warn, Error).
 * @param {...unknown} args - The content to be logged.
 */
const logMessage = (level: LogLevel, ...args: unknown[]) => {
  // Apply appropriate styling based on log level
  const logStyle = {
    [LogLevel.Log]: chalk.bold.green,
    [LogLevel.Warn]: chalk.bold.yellow,
    [LogLevel.Error]: chalk.bold.red,
  }[level];

  // Use stack-trace to get calling code information
  const stackFrame = stackTrace.get()[2];
  const filePath = stackFrame.getFileName();
  const line = stackFrame.getLineNumber();
  const column = stackFrame.getColumnNumber();

  // Log to the console with file name, line number, and column number
  console[LogLevel.Log](
    logStyle(`[${level.toUpperCase()}]`),
    chalk.gray(`${filePath}:${line}:${column}`),
  );

  args.forEach((arg) => {
    if (typeof arg === 'string') {
      console[LogLevel.Log](logStyle(arg));
    } else if (arg instanceof Error) {
      console[LogLevel.Error](logStyle(arg.message));
    } else {
      console.dir(arg, { colors: true, depth: 5 });
    }
  });
};

/**
 * Logs a message or object to the console.
 *
 * @param {...unknown} args - The content to be logged.
 */
export const log = (...args: unknown[]) => {
  logMessage(LogLevel.Log, ...args);
};

/**
 * Logs a warning message to the console.
 *
 * @param {...unknown} args - The content to be logged.
 */
export const warn = (...args: unknown[]) => {
  logMessage(LogLevel.Warn, ...args);
};

/**
 * Logs an error message to the console.
 *
 * @param {...unknown} args - The content to be logged.
 */
export const error = (...args: unknown[]) => {
  logMessage(LogLevel.Error, ...args);
};

export const underline = chalk.underline;
export const bold = chalk.bold;
export const italic = chalk.italic;
