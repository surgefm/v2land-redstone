import { RedstoneRequest, RedstoneResponse } from '@Types';
import { InviteCodeService } from '@Services';

async function inviteCode(req: RedstoneRequest, res: RedstoneResponse) {
  const invite = await InviteCodeService.isValid(req.query && req.query.inviteCode as string);
  if (invite) {
    return res.status(200).json({ invite });
  } else {
    return res.status(400).json({ message: 'Invalid code.' });
  }
}

export default inviteCode;
