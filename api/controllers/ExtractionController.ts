import Mercury from '@postlight/mercury-parser';
import { RedstoneRequest, RedstoneResponse } from '@Types';

export async function extract(req: RedstoneRequest, res: RedstoneResponse) {
  const url = encodeURI(decodeURIComponent(req.query.url));
  if (!url) {
    return res.status(400).json({
      message: 'Missing parameter: url.',
    });
  }

  try {
    const result = await Mercury.parse(url);
    return res.status(200).json({
      result: {
        url: result.url,
        title: result.title,
        abstract: result.excerpt,
        time: result.date_published,
        source: result.domain,
      },
    });
  } catch (err) {
    console.error('Failed to crawl', url, err);
    res.status(400).json({
      message: '新闻抓取失败',
    });
  }
}
