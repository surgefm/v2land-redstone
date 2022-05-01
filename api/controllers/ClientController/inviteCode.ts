import { RedstoneRequest, RedstoneResponse } from '@Types';
import { InviteCodeService } from '@Services';

async function inviteCode(req: RedstoneRequest, res: RedstoneResponse) {
  const invite = await InviteCodeService.isValid(req.query && req.query.inviteCode);
  if (invite) {
    res.status(200).json({ invite });
  } else {
    res.status(400).json({ message: 'Invalid code.' });
  }
}

export default inviteCode;
