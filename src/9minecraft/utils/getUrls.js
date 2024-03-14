import chalk from 'chalk';
import { getUrlsPage } from './getUrlsPage.js';
import { delay } from '../../commonUtils/delay.js';
import { saveToJson } from '../../commonUtils/saveToJson.js';
import { LIST_URL, TEMP_FOLDER, URLS_MODS } from '../constants.js';

export async function getUrls() {
  const result = [];
  let page = 1;
  let id = 56;
  const urlPage = LIST_URL + page;
  try {
    const [lastId, lastPage, modsInfo] = await getUrlsPage(urlPage, id);
    id = lastId;
    result.push(...modsInfo);
    await delay(1000);
    for (page = 2; page <= lastPage; page++) {
      const urlPage = LIST_URL + page;
      const [lastId, _, modsInfo] = await getUrlsPage(urlPage, id);
      id = lastId;
      result.push(...modsInfo);
      await delay(1000);
      console.log(page);
    }
    await saveToJson(TEMP_FOLDER, URLS_MODS, result);
  } catch (error) {
    console.log('getUrls', chalk.red(error));
  }
}
