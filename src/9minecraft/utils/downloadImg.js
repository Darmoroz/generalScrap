import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';

import { saveToJson } from '../../commonUtils/saveToJson.js';
import { delay } from '../../commonUtils/delay.js';

export async function downloadImg(arr) {
  console.log('total mods', arr.length);
  const result = [];
  const folderName = `../../data/9minecraft_net/images/`;
  const folderNamePreview = `${folderName}preview/`;
  for (let idx = 0; idx < arr.length; idx++) {
    const mod = arr[idx];
    const { id, previewSrc, howToUse } = mod;
    const fileFormatPreview = previewSrc.substring(previewSrc.lastIndexOf('.'));
    const fileNamePreview = `id${id}${fileFormatPreview}`;
    const preview = `images/preview/${fileNamePreview}`;
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    if (!fs.existsSync(folderNamePreview)) {
      fs.mkdirSync(folderNamePreview);
    }
    try {
      const responsePreview = await axios({
        method: 'get',
        url: previewSrc,
        responseType: 'stream',
      });
      const writerPreview = fs.createWriteStream(`${folderNamePreview}${fileNamePreview}`);
      responsePreview.data.pipe(writerPreview);
      await new Promise((resolve, reject) => {
        writerPreview.on('finish', resolve);
        writerPreview.on('error', reject);
      });
      console.log(`${fileNamePreview} завантажено успішно.`);
      await delay(1000);
    } catch (error) {
      console.log('downloadImgPreview', chalk.red(error));
    }
    let imageCount = 1;
    const howToUseNew = [];
    for (let i = 0; i < howToUse.length; i++) {
      const item = howToUse[i];
      if (!('image' in item)) {
        howToUseNew.push(item);
        continue;
      }
      const folderNameInstructions = `${folderName}instructions/`;
      if (!fs.existsSync(folderNameInstructions)) {
        fs.mkdirSync(folderNameInstructions);
      }
      const imageSrc = item.imageSrc;
      const fileFormatInstructions = imageSrc.substring(imageSrc.lastIndexOf('.'));
      const fileNameInstructions = `id${id}_${imageCount}_instr${fileFormatInstructions}`;
      imageCount += 1;
      const image = `images/instructions/${fileNameInstructions}`;
      howToUseNew.push({ ...item, image });
      try {
        const responseInstr = await axios({
          method: 'get',
          url: imageSrc,
          responseType: 'stream',
        });
        const writerInstructions = fs.createWriteStream(
          `${folderNameInstructions}${fileNameInstructions}`
        );
        responseInstr.data.pipe(writerInstructions);
        await new Promise((resolve, reject) => {
          writerInstructions.on('finish', resolve);
          writerInstructions.on('error', reject);
        });
        console.log(`${fileNameInstructions} завантажено успішно.`);
        await delay(1000);
      } catch (error) {
        console.log('downloadImgHowToUse', chalk.red(error));
      }
    }
    result.push({ ...mod, preview, howToUse: howToUseNew });
    try {
      await saveToJson('./tempData/', 'modsPreview.json', result);
    } catch (error) {
      console.log('downloadImgsaveToJson', chalk.red(error));
    }
  }
}
