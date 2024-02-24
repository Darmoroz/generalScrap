import chalk from 'chalk';
import axios from 'axios';
import { delay } from '../../commonUtils/delay.js';
import { getDetailInfoItem } from './getDetailInfoItem.js';
import { saveToJson } from '../../commonUtils/saveToJson.js';

export async function getDetailInfoItems(urls) {
  const result = [];
  for (let i = 0; i < urls.length; i++) {
    const region = urls[i];
    console.log(region.city);
    const items = region.urlsItems;
    const itemsFullInfo = [];
    for (let j = 0; j < items.length; j++) {
      const url = items[j];

      try {
        const { data } = await axios.get(url);
        await delay(1000);
        const itemDetailInfo = getDetailInfoItem(data);
        itemsFullInfo.push({ ...itemDetailInfo, url });
        console.log(j, '\\', items.length);
      } catch (error) {
        console.log('getDetailInfoItems', chalk.red(error));
      }
    }
    result.push({ city: region.city, items: itemsFullInfo });
    await saveToJson('../../data/barb_ua/', `${region.city}.json`, {
      city: region.city,
      items: itemsFullInfo,
    });
  }
  return result;
}
