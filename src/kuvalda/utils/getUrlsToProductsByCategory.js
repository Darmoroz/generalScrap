import chalk from 'chalk';

import { BASEURL } from '../constans.js';
import { QUERY } from '../constans.js';
import { getUrlsFromPagePagin } from './getUrlsFromPagePagin.js';

export async function getUrlsToProductsByCategory(category) {
  const urlsTotal = [];
  let page = 1;
  let url = `${BASEURL}${category}${page}${QUERY}`;
  try {
    const [totalProducts, urls] = await getUrlsFromPagePagin(url);
    urlsTotal.push(...urls);
    console.log(page, '->', urlsTotal.length);
    if (!totalProducts) {
      return urlsTotal;
    }
    const totalPages = Math.ceil(totalProducts / 60);

    for (page = 2; page <= totalPages; page++) {
      url = `${BASEURL}${category}${page}${QUERY}`;
      const [_, urls] = await getUrlsFromPagePagin(url);
      urlsTotal.push(...urls);
      console.log(page, '->', urlsTotal.length);
    }
  } catch (error) {
    console.log('ByCategory', chalk.red(error));
  }
  return urlsTotal;
}
