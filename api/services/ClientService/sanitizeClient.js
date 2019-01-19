function sanitizeClient (client) {
  const temp = {};
  for (const attr of ['username', 'role', 'id']) {
    temp[attr] = client[attr];
  }

  return temp;
}

module.exports = sanitizeClient;
