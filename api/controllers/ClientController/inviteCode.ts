import { RedstoneRequest, RedstoneResponse } from '@Types';
import { globals } from '@Configs';

async function inviteCode (req: RedstoneRequest, res: RedstoneResponse) {
  if (req.query && req.query.code === globals.inviteCode) {
    res.status(200).json({ message: 'Correct.' });
  } else {
    res.status(400).json({ message: 'Wrong' });
  }
}

export default inviteCode;
