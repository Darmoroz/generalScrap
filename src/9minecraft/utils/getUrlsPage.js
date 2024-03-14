import axios from 'axios';
import chalk from 'chalk';
import { JSDOM } from 'jsdom';

export async function getUrlsPage(url, id) {
  try {
    const { data } = await axios.get(url);
    const { document } = new JSDOM(data).window;
    const lastPage = +document.querySelector('.page-numbers.dots').nextElementSibling?.textContent;
    const mods = [...document.querySelectorAll('.list-post .item')];
    const modsInfo = mods.map(mod => {
      const url = mod.querySelector('.thumbindex a').href;
      return { url };
    });
    modsInfo.forEach(mod => {
      mod.id = id;
      id++;
    });
    return [id, lastPage, modsInfo];
  } catch (error) {
    console.log('getUrlsPage', chalk.red(error));
  }
}
