import { defineEventHandler } from 'h3';
import items from '../../public/data.json';

export default defineEventHandler(async (event) => {
  const sitemapEntries = items.map((item) => {
    const pathPrefix = item.type === 'city' ? '/city' : '/country';
    return {
      loc: `${pathPrefix}/${item.slug}`,
      lastmod: new Date().toISOString(),
    };
  });

  return sitemapEntries;
});
