export const RedstoneErrorIdentifier = 'REDSTONE_ERROR';
export const InvalidInputErrorType = 'Invalid input';
export const ResourceNotFoundErrorType = 'Resource not found';
export const ErrorStatusCode: { [index: string]: number } = {
  [InvalidInputErrorType]: 400,
  [ResourceNotFoundErrorType]: 404,
};

class RedstoneError extends Error {
  name = RedstoneErrorIdentifier;
  message: string;
  errorType: string;
  statusCode: number;

  constructor(errorType: string, message: string, statusCode = 400) {
    super(message);
    this.errorType = errorType;
    this.message = message;
    this.statusCode = ErrorStatusCode[errorType] || statusCode;
  }
}

export default RedstoneError;
