import * as bcrypt from 'bcrypt';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService } from '@Services';

async function login (req: RedstoneRequest, res: RedstoneResponse) {
  const data = req.body;

  const client = await ClientService.findClient(data.username, {
    withAuths: false,
    withSubscriptions: false,
    withPassword: true,
  });

  if (!client) {
    return res.status(404).json({
      message: '未找到该用户',
    });
  }

  const verified = await bcrypt.compare(data.password, client.password);

  if (!verified) {
    return res.status(401).json({
      message: '错误的用户名、邮箱或密码',
    });
  }

  req.session.clientId = client.id;
  const clientObj: any = client.get({ plain: true });
  delete clientObj.password;

  res.status(200).json({
    message: '登录成功',
    client: clientObj,
  });
}

export default login;
