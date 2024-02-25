import axios from 'axios';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';

export async function getUrlsFromPagePagin(url) {
  try {
    const { data } = await axios.get(url);
    const { document } = new JSDOM(data).window;
    let urls = [
      ...document.querySelectorAll('.catalog__list>.catalog__list-item a.alt-snippet__title'),
    ].map(i => `https://www.kuvalda.ru${i.href}`);
    if (urls.length === 0) {
      urls = [
        ...document.querySelectorAll('.catalog__list>.catalog__list-item a.snippet__title'),
      ].map(i => `https://www.kuvalda.ru${i.href}`);
    }
    const totalProducts = parseInt(
      document.querySelector('.catalog__pagination .pagination-group__found b')?.textContent
    );
    return [totalProducts, urls];
  } catch (error) {
    console.log('FromPagePagin', chalk.red(error));
  }
}
