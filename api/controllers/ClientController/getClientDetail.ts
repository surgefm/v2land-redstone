import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService } from '@Services';

async function getClientDetail (req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = req.session.clientId;

  if (!clientId) {
    return res.status(401).json({
      message: '你还未登录',
    });
  }

  const client = await ClientService.findClient(clientId);
  if (!client) {
    delete req.session.clientId;
    return res.status(404).json({
      message: '未找到该用户',
    });
  }

  res.status(200).json({ client });
}

export default getClientDetail;
