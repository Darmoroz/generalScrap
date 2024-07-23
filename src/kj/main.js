import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';

import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { saveImg } from "../commonUtils/saveImg.js";

const initFileName = 'workData/kjData';

async function getItemInfo(initFile) {
  const results = [];
  try {
    const items = await parseJSONFile(initFile);
    let idx = 0;
    while (idx < items.length) {
      // while (idx < 1) {
      const item = items[idx];
      const link = item.link;
      const { data } = await axios.get(link);
      const { document } = new JSDOM(data).window;
      const title = document.querySelector('h1')?.textContent.trim();
      const desc =
        'Ensure Uninterrupted Power: With the KJ Power Diesel Generator, We Are Ready for Any Moment, Any Situation!\nMany industries that rely on electrical sources require an uninterrupted power supply. This is where the KJ Power Diesel Generator comes into play, standing out as a high-quality product designed to ensure optimal performance in case of any sudden power outage.';
      const weigth = document
        .querySelector('.row.gy-4>div:last-child hr + div')
        ?.textContent.trim();
      const specTech = [...document.querySelectorAll('#pills-technical tbody tr')]
        .filter(it => it.classList.length === 0)
        .reduce((acc, curr) => {
          const allTr = [...curr.querySelectorAll('td')].map(it => it.textContent.trim());
          const spec = { title: allTr[0], unit: allTr[1], values: allTr[2] };
          acc.push(spec);
          return acc;
        }, []);
      const desc1 = [...document.querySelectorAll('#pills-optional tbody td')]
        .map(it => `- ${it?.textContent}`)
        .join('\n');
      const optionalDesc = `Optional Specifications\n${desc1}`;
      const images = ['https://www.kj.com.tr/assets/img/product-demo.png'];
      const dimensionImgs = [...document.querySelectorAll('#pills-dimensions tbody img')].map(
        it => it.src
      );
      images.push(...dimensionImgs);
      const pdfDataSheetLink = [...document.querySelectorAll('#pills-documents hr +div>a')].filter(
        it => it?.textContent.trim() === 'English'
      )?.[0]?.href;
      specTech.push({ title: 'Weigth', unit: '(kg)', values: weigth?.replace(' kg', '') });
      results.push({ ...item, title, optionalDesc, pdfDataSheetLink, images, specTech });
      idx++;
      console.log('idx', idx, 'of', items.length);
      console.log(link);
    }
    await saveToJson('', initFile, results);
  } catch (error) {
    console.log(error);
  }
}

// getItemInfo(initFileName);

async function getPdfFilies(initJson) {
  const items = await parseJSONFile(initJson);
  const folderName = 'workData/pdf/';
  let errorCount = 0;
  let totalPdfs = 0;
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  for (let idx = 0; idx < items.length; idx++) {
  // for (let idx = 0; idx < 1; idx++) {
    const item = items[idx];
    const { pdfDataSheetLink, name } = item;
    const pdfFileName = `${name}.pdf`;
    const filePath = folderName + pdfFileName;
		try {
			await saveImg(pdfDataSheetLink, filePath);
			totalPdfs++;
			
		} catch (error) {
			errorCount++;
			
		}
		console.log(idx)
  }
	console.log('errorCount', errorCount);
  console.log('totalImgs', totalPdfs);
  console.log(items.length);
}
// getPdfFilies(initFileName);

async function temp(initJson) {
  const items = await parseJSONFile(initJson);
	items.forEach(it=>{
	
	})
	// await saveToJson('', initJson, items);

}

temp(initFileName)
