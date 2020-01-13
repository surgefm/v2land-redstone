import { RedstoneRequest, RedstoneResponse } from '@Types';

async function logout (req: RedstoneRequest, res: RedstoneResponse) {
  delete req.session.clientId;

  res.status(200).json({
    message: '成功退出登录',
  });
}

export default logout;
