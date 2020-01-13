/**
 * @file utils/errors/MissingParameterError.js
 */
class MissingParameterError extends Error {
  constructor(parameters: string | string[]) {
    let string = 'Missing parameters';
    if (parameters) {
      string += ': ';
      if (typeof parameters === 'string') {
        string += parameters;
      } else {
        string += parameters.join(', ');
      }
    }
    string += '.';
    super(string);
    Error.captureStackTrace(this, MissingParameterError);
  }
}

export default MissingParameterError;
