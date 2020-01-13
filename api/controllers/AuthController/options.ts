import { Request, Response } from 'express';
import { oauth } from '@Configs';

function options (req: Request, res: Response) {
  res.status(200).json({
    twitter: oauth.twitter ? true : false,
    weibo: oauth.weibo ? true : false,
  });
}

export default options;
