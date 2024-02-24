import chalk from 'chalk';
import { delay } from '../../commonUtils/delay.js';
import { saveToJson } from '../../commonUtils/saveToJson.js';
import { closeModal } from './closeModal.js';

export async function getDetailInfoItemsPup(page, inputData) {
  const result = [];
  for (let i = 0; i < inputData.length; i++) {
    const region = inputData[i];
    const items = region.items;
    console.log(region.city);
    const itemsFullInfo = [];

    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const url = item.url;
      let phoneNumber = item.tel_0;
      if (phoneNumber) {
        itemsFullInfo.push(item);
        await saveToJson('../../data/barb_ua/', `${region.city}.json`, itemsFullInfo);
        continue;
      }
      try {
        await page.goto(url);
        await delay(2000);

        const isOpenModal = await page.evaluate(() => {
          return document.body.className.includes('modal-open');
        });
        if (isOpenModal) {
          await closeModal(page);
        }

        const phoneEl = await page.$('.seller-detail__description-wrapper a.click_by_phone');
        if (phoneEl) {
          await page.evaluate(element => element.click(), phoneEl);
          await delay(1000);
          const noPhone = await page.$('textarea[placeholder]');
          if (noPhone) {
            itemsFullInfo.push(item);
            await saveToJson('../../data/barb_ua/', `${region.city}.json`, itemsFullInfo);
            continue;
          }

          let phoneNumEl = await page.$$('#getMelistingPhones a');
          while (phoneNumEl.length < 1) {
            await delay(1000);
            phoneNumEl = await page.$$('#getMelistingPhones a');
          }

          phoneNumber = await page.evaluate(() => {
            const phones = [...document.querySelectorAll('#getMelistingPhones a')]
              .map(i => i.href.replace('tel:', ''))
              .reduce((acc, curr, idx) => {
                acc[`tel_${idx}`] = curr;
                return acc;
              }, {});
            return phones;
          });
          itemsFullInfo.push({ ...item, ...phoneNumber });
          await saveToJson('../../data/barb_ua/', `${region.city}.json`, itemsFullInfo);
        } else {
          itemsFullInfo.push(item);
          await saveToJson('../../data/barb_ua/', `${region.city}.json`, itemsFullInfo);
        }

        console.log(j, '\\', items.length);
      } catch (error) {
        console.log('getDetailInfoItemsPup', chalk.red(error));
      }
    }
    result.push({ city: region.city, items: itemsFullInfo });
  }
  await saveToJson('../../data/barb_ua/', `resultFull_barb.json`, result);
  return result;
}
