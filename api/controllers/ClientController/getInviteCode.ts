import { RedstoneRequest, RedstoneResponse } from '@Types';
import { InviteCode } from '@Models';
import { AccessControlService, InviteCodeService } from '@Services';

async function getInviteCode(req: RedstoneRequest, res: RedstoneResponse) {
  let invites = await InviteCode.findAll({ where: { ownerId: req.session.clientId } });
  if (await AccessControlService.isClientEditor(req.session.clientId) && invites.length < 5) {
    for (let i = invites.length; i < 5; i++) {
      await InviteCodeService.createInviteCode(req.session.clientId);
    }
    invites = await InviteCode.findAll({ where: { ownerId: req.session.clientId } });
  }
  res.status(200).json({ invites });
}

export default getInviteCode;
