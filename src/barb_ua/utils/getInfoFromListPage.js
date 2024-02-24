import chalk from 'chalk';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { normalizeStr } from '../../commonUtils/normalizeStr.js';

export async function getInfoFromListPage(url) {
  try {
    const { data } = await axios.get(url);
    const { document } = new JSDOM(data).window;

    const totalResultEl = document.querySelector('#form-sorting .search-result__quantity');
    const totalResult = totalResultEl
      ? normalizeStr(totalResultEl.textContent.match(/\d+(\s|[,\.]\d+)?/)?.[0])
      : null;
    const totalPages = Math.ceil(totalResult / 25);

    const cityEl = document.querySelector('span.city-menu__selected');
    const city = cityEl ? normalizeStr(cityEl.textContent) : null;

    const urlsItems = [...document.querySelectorAll('h2.seller-info__list-header a')].map(
      i => i.href
    );

    return [totalPages, city, urlsItems];
  } catch (error) {
    console.log('getInfoFromListPage', chalk.red(error));
  }
}
