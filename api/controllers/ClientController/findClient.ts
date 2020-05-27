import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService } from '@Services';

async function findClient(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.clientName;
  const clientId = await ClientService.getClientId(name);
  const client = await ClientService.findClient(clientId);

  if (!client) {
    return res.status(404).json({
      message: '未找到该用户',
    });
  }

  if (req.session.clientId === client.id) {
    return res.status(200).json({ client });
  } else if (req.session.clientId) {
    const currentClient = await ClientService.findClient(req.session.clientId);
    if (currentClient.role === 'admin') {
      return res.status(200).json({ client });
    }
  }

  return res.status(200).json({
    client: ClientService.sanitizeClient(client),
  });
}

export default findClient;
