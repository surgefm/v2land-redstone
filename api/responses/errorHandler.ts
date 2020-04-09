import {
  RedstoneRequest, RedstoneResponse, NextFunction,
  RedstoneError, RedstoneErrorIdentifier, InvalidInputErrorType,
} from '@Types';
import { ServerResponse } from 'http';
import { ValidationError } from 'sequelize';

function errorHandler(err: Error, req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) {
  if (!err || err instanceof ServerResponse) return next();
  (req.log || console).error(err);

  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      error: InvalidInputErrorType,
      message: (err as ValidationError).errors.map(e => e.message).join('；'),
    });
    return next();
  } else if (err.name === RedstoneErrorIdentifier) {
    const redstoneErr = err as RedstoneError;
    res.status(redstoneErr.statusCode).json({
      error: redstoneErr.errorType,
      message: redstoneErr.message,
    });
    return next();
  }

  res.status(400).json({
    message: err.message,
  });
  next();
}

export default errorHandler;
