import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import { JSDOM } from 'jsdom';

import { saveToJson } from '../../commonUtils/saveToJson.js';
import { delay } from '../../commonUtils/delay.js';

export async function downloadMods(arr) {
  const errMods = [];
  const result = [];
  for (let idx = 400; idx < arr.length; idx++) {
    const mod = arr[idx];
    const { modsPath, id } = mod;
    console.log(idx, '->', arr.length - 1, '->', id);
    const folderName = `../../data/9minecraft_net/mods/id${id}/`;
    const modPathNew = [];

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    for (let i = 0; i < modsPath.length; i++) {
      const item = modsPath[i];
      const { type, modSrc_0 } = item;
      try {
        const { data } = await axios.get(modSrc_0);
        const { document } = new JSDOM(data).window;
        const srcMod = document.querySelector('#download-button').href;
        const fileModName = document.querySelector('.file_text strong')?.textContent;
        const path = `mods/id${id}/${fileModName}`;
        modPathNew.push({ type, path });
        const response = await axios({
          method: 'get',
          url: srcMod,
          responseType: 'stream',
        });
        const writer = fs.createWriteStream(`${folderName}${fileModName}`);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        console.log(`${fileModName} завантажено успішно.`);
        await delay(1000);
      } catch (error) {
        errMods.push(mod);
        await saveToJson('./tempData/', 'errMod.json', errMods);
        console.log('downloadModsGetUrl', chalk.red(error));
      }
    }
    result.push({ ...mod, modsPath: modPathNew });
    try {
      await saveToJson('./tempData/', 'modsAll.json', result);
    } catch (error) {
      console.log('downloadModSaveToJson', chalk.red(error));
    }
  }
}
