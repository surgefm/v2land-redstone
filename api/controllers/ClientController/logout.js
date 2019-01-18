async function logout (req, res) {
  delete req.session.clientId;

  res.send(200, {
    message: '成功退出登录',
  });
}

module.exports = logout;
