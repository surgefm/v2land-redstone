async function inviteCode (req, res) {
  if (req.query && req.query.code === sails.config.globals.inviteCode) {
    res.status(200).json({ message: 'Correct.' });
  } else {
    res.status(400).json({ message: 'Wrong' });
  }
}

module.exports = inviteCode;
