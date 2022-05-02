import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService, AccessControlService } from '@Services';

async function findClient(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.clientName;
  const clientId = await ClientService.getClientId(name);
  const client = clientId ? await ClientService.findClient(clientId, { withEvents: true }) : null;

  if (!client) {
    return res.status(404).json({
      message: '未找到该用户',
    });
  }

  if (req.session.clientId === client.id) {
    return res.status(200).json({ client: ClientService.sanitizeClient(client, true) });
  } else if (req.session.clientId) {
    if (await AccessControlService.isClientAdmin(req.session.clientId)) {
      return res.status(200).json({ client: ClientService.sanitizeClient(client, true) });
    }
  }

  return res.status(200).json({
    client: ClientService.sanitizeClient(client),
  });
}

export default findClient;
