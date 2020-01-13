import validator from 'validator';

function isURL(url: string) {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
}

export default isURL;
