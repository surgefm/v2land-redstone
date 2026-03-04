import { Site, News, EventStackNews, Sequelize } from '@Models';
import { uploadFromUrl, hasS3 } from '@Services/UploadService';
import { Op } from 'sequelize';

export async function findOrCreateBySourceName(
  sourceName: string,
  articleUrl: string,
): Promise<Site | null> {
  if (!sourceName) return null;

  const existing = await Site.findOne({
    where: Sequelize.where(
      Sequelize.fn('lower', Sequelize.col('name')),
      sourceName.toLowerCase().trim(),
    ),
  });

  if (existing) {
    // Backfill icon if site exists but has no icon yet
    if (!existing.icon && hasS3) {
      try {
        const domain = existing.domains?.[0] || new URL(articleUrl).hostname.replace(/^www\./, '');
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        const icon = await uploadFromUrl(faviconUrl, '.png');
        if (icon) await existing.update({ icon });
      } catch (e) {
        console.warn(`SiteService: icon backfill failed for "${existing.name}":`, e.message);
      }
    }
    return existing;
  }

  let homepage: string | undefined;
  let icon: string | undefined;
  let domain: string | undefined;

  try {
    const url = new URL(articleUrl);
    homepage = url.origin;
    domain = url.hostname.replace(/^www\./, '');

    if (hasS3) {
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      icon = await uploadFromUrl(faviconUrl, '.png');
    }
  } catch (e) {
    console.warn(`SiteService: failed to process URL or fetch icon for "${sourceName}":`, e.message);
  }

  const site = await Site.create({
    name: sourceName.trim(),
    domains: domain ? [domain] : [],
    homepage,
    icon,
  });

  return site;
}

async function backfillNewsList(newsList: News[], label: string): Promise<number> {
  let count = 0;
  for (const news of newsList) {
    try {
      const site = await findOrCreateBySourceName(news.source, news.url);
      if (site) {
        await news.update({ siteId: site.id });
        count++;
      }
    } catch (e) {
      console.warn(`SiteService: failed to backfill news ${news.id}:`, e.message);
    }
  }
  if (count > 0) {
    console.log(`SiteService: backfilled ${count} ${label} news items`);
  }
  return count;
}

export async function ensureAllNewsHaveSiteIcons(): Promise<void> {
  const noSiteCondition = {
    siteId: { [Op.is]: null as any },
    source: { [Op.and]: [{ [Op.ne]: null as any }, { [Op.ne]: '' }] },
  };

  // Phase 1: news currently in stacks (visible in timelines)
  const inStackNewsIds = await EventStackNews.findAll({
    where: { stackId: { [Op.ne]: null as any } },
    attributes: ['newsId'],
    group: ['newsId'],
  });
  const stackNewsIdSet = new Set(inStackNewsIds.map((esn) => esn.newsId));

  if (stackNewsIdSet.size > 0) {
    const inStackNews = await News.findAll({
      where: { ...noSiteCondition, id: { [Op.in]: [...stackNewsIdSet] } },
    });
    if (inStackNews.length > 0) {
      console.log(`SiteService: backfilling ${inStackNews.length} in-stack news first...`);
      await backfillNewsList(inStackNews, 'in-stack');
    }
  }

  // Phase 2: remaining news (off-shelf, orphaned, etc.)
  const remainingNews = await News.findAll({ where: noSiteCondition });
  if (remainingNews.length > 0) {
    console.log(`SiteService: backfilling ${remainingNews.length} remaining news...`);
    await backfillNewsList(remainingNews, 'remaining');
  }

  // Phase 3: fill icons for sites that were created without S3
  if (hasS3) {
    const sitesWithoutIcons = await Site.findAll({
      where: { icon: { [Op.is]: null as any } },
    });
    if (sitesWithoutIcons.length > 0) {
      console.log(`SiteService: fetching icons for ${sitesWithoutIcons.length} sites...`);
      for (const site of sitesWithoutIcons) {
        try {
          const domain = site.domains?.[0] || (site.homepage ? new URL(site.homepage).hostname.replace(/^www\./, '') : null);
          if (!domain) continue;
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
          const icon = await uploadFromUrl(faviconUrl, '.png');
          if (icon) await site.update({ icon });
        } catch (e) {
          console.warn(`SiteService: failed to fetch icon for site ${site.id} (${site.name}):`, e.message);
        }
      }
      console.log('SiteService: site icon fetch complete');
    }
  }

  console.log('SiteService: backfill complete');
}
