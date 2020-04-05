export const RedstoneErrorIdentifier = 'REDSTONE_ERROR';
export const InvalidInputErrorType = 'Invalid input';

class RedstoneError extends Error {
  name = RedstoneErrorIdentifier;
  message: string;
  errorType: string;
  statusCode: number;

  constructor(errorType: string, message: string, statusCode = 400) {
    super(message);
    this.errorType = errorType;
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default RedstoneError;
