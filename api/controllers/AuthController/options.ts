import { RedstoneRequest, RedstoneResponse } from '@Types';
import { oauth } from '@Configs';

async function options (req: RedstoneRequest, res: RedstoneResponse) {
  res.status(200).json({
    twitter: oauth.twitter ? true : false,
    weibo: oauth.weibo ? true : false,
  });
}

export default options;
