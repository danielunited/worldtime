import { defineEventHandler } from 'h3';
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const dataPath = path.resolve('public/data.json');
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const sitemapEntries = items.map((item) => {
    const pathPrefix = item.type === 'city' ? '/city' : '/country';
    return {
      loc: `${pathPrefix}/${item.slug}`,
      lastmod: new Date().toISOString(),
    };
  });

  return sitemapEntries;
});
