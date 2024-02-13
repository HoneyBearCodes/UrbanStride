import { NextFunction } from 'express';

export const handleError = (err: unknown, next: NextFunction): void => {
  if (err instanceof Error) {
    return next(err);
  } else if (typeof err === 'string') {
    const error = new Error(err);
    return next(error);
  }
};
