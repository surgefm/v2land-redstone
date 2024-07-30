import { Auth } from '@Models';
import { globals } from '@Configs';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function googleCallback(req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.query && req.query.code && req.query.state)) {
    return res.status(400).json({
      message: '请求缺少 code 或 state 参数',
    });
  }

  const { code, state } = req.query;
  const auth = await Auth.findByPk(state as string);

  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  if (auth.redirect) {
    res.redirect(302, `${auth.redirect}&code=${code}&authId=${state}&site=google`);
  } else {
    res.redirect(302, `${globals.api}/auth/google/redirect?code=${code}&authId=${state}`);
  }
}

export default googleCallback;
