import chalk from 'chalk';

import { delay } from '../../commonUtils/delay.js';
import { getInfoFromListPage } from './getInfoFromListPage.js';

import { BASEURL, URLSCATEGORY } from '../constants.js';

export async function getUrlsEachItem() {
  const urlsItemsByCity = [];
  for (let i = 1; i < URLSCATEGORY.length; i++) {
    const category = URLSCATEGORY[i];
    console.log(category);
    const totalUrlsItems = [];
    let paginationPage = 1;
    let url = `${BASEURL}${category}?page=${paginationPage}`;
    try {
      const [totalPages, city, urlsItems] = await getInfoFromListPage(url);
      totalUrlsItems.push(...urlsItems);
      if (totalPages === 1 || !totalPages) {
        urlsItemsByCity.push({ city, urlsItems: totalUrlsItems });
        console.log(city, '-->', totalUrlsItems.length);
        continue;
      }
      await delay(2000);
      console.log(paginationPage);
      for (paginationPage = 2; paginationPage <= totalPages; paginationPage++) {
        url = `${BASEURL}${category}?page=${paginationPage}`;
        const [_, __, urlsItems] = await getInfoFromListPage(url);
        totalUrlsItems.push(...urlsItems);
        await delay(2000);
        console.log(paginationPage);
      }
      urlsItemsByCity.push({ city, urlsItems: totalUrlsItems });
      console.log(city, '-->', totalUrlsItems.length);
    } catch (error) {
      console.log('getUrlsEachItem', chalk.red(error));
    }
  }
  return urlsItemsByCity;
}
