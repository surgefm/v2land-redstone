/**
 * @file utils/errors/MissingParameterError.js
 */
class MissingParameterError extends Error {
  constructor(parameters, fileName, lineNumber) {
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
    super(string, fileName, lineNumber);
    Error.captureStackTrace(this, MissingParameterError);
  }
}

module.exports = MissingParameterError;
