import axios from 'axios';
import chalk from 'chalk';
import { JSDOM } from 'jsdom';

import { mods } from '../tempData/mods.js';
import { normalizeStr } from '../../commonUtils/normalizeStr.js';
import { saveToJson } from '../../commonUtils/saveToJson.js';
import { delay } from '../../commonUtils/delay.js';
import { extractTitle, getHowToUse, getPositionByText } from '../helpers/index.js';

export async function getModInfo() {
  const result = [];
  const errorArr = [];
  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    const { url, id, is_vip } = mod;
    console.log(i, '->', mods.length - 1, '->', id);
    try {
      const { data } = await axios.get(url);
      const { document } = new JSDOM(data).window;

      let category = normalizeStr(
        document.querySelector('.posttags a')?.textContent.replace(/Add-ons|Mods|\d+(\.\d+)?/g, '')
      );
      if (category.includes('MCPE')) {
        category = 'Other';
      }

      const title = extractTitle(document.querySelector('h1')?.textContent);

      const description = normalizeStr(document.querySelector('.postContent p')?.textContent);

      const preview = `images/preview/id${id}.jpg`;
      const previewSrc = document.querySelector('.postContent img').dataset.src;

      const howToUseAll = [...document.querySelector('.postContent').children];
      const [firstPosition, lastPosition] = getPositionByText(howToUseAll);
      const howToUseRes = howToUseAll.slice(firstPosition, lastPosition);
      const howToUse = getHowToUse(howToUseRes, id);

      const downloadModsVer = [...document.querySelectorAll('blockquote')];
      const downloadEl = downloadModsVer[downloadModsVer.length - 1];
      const download = [...downloadEl.querySelectorAll('p')];
      const modsPath = download.map(item => {
        let type = normalizeStr(item.childNodes?.[0].nodeValue?.replace(':', ''));
        if (!type) {
          type = 'Other';
        }
        const path = `mods/id${id}/`;
        const modSrc = [...item.querySelectorAll('a')]
          .map(i => i.href)
          .reduce((acc, curr, idx) => {
            acc[`modSrc_${idx}`] = curr;
            return acc;
          }, {});

        return { type, path, ...modSrc };
      });

      const modInfo = {
        url,
        category,
        id,
        is_vip,
        title,
        description,
        preview,
        previewSrc,
        howToUse,
        modsPath,
      };
      result.push(modInfo);
      await saveToJson('./tempData/', 'abra.json', result);
    } catch (error) {
      errorArr.push(mod);
      await saveToJson('./tempData/', 'error.json', errorArr);
      console.log('getModInfo', chalk.red(error));
    } finally {
      await delay(5000);
    }
  }
}
