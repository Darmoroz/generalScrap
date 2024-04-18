import puppeteer from 'puppeteer';

import {delay} from '../commonUtils/delay.js'
import { saveToJson } from "../commonUtils/saveToJson.js";
import { filtersTotal } from "./workData/filtersTotal.js";

console.log(filtersTotal.length)
// async function main(items) {
//   try {
//     const browser = await puppeteer.launch({
//       // headless: false,
//       defaultViewport: {width:1980, height:1080},
//     });
//     const [page] = await browser.pages();

// 	const result=[]

// 		for (let idx = 0; idx < items.length; idx++) {
// 			const item = items[idx];
// 			const url=item.urlUk
// 			await page.goto(url)
// 			await delay(500)
// 			const pictureBtn=await page.$('div.um627v picture')
// 			if (pictureBtn) {
// 				pictureBtn.click();
// 			}
// 			await delay(500)
// 			const imgsUrls= await page.evaluate(()=>{
// 				const urls=[...document.querySelectorAll('div.mYZ83w picture._2ap4HP img._2aWYDv._2lM64i')].map(i=>i.src)
// 				return urls
// 			})
// 			result.push({...item, ['Фото']:imgsUrls})
// 			console.log(idx,'/',items.length-1)
// 		}
// 		await saveToJson('./','oilF.json', result)
//   } catch (error) {
//     console.log('ERROR!!!!', error);
//   }
// }

// await main(oilFilter)

// *
// const b=filtersTotal.map(i=>i.spec)

// *
const b=filtersTotal;
b.forEach(el=>{
	el['Фото']=el['Фото'].join(';')
	delete el.urlUk;
	delete el.urlRu;
	delete el.id;
	delete el.spec;

})
await saveToJson('./', 'total.json', b)