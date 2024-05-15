import axios from 'axios';
import excel from 'excel4node';

import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { delay } from '../commonUtils/delay.js';

async function first() {
  const mafs = await parseJSONFile('./mafs.json');
  const egr = await parseJSONFile('./egr.json');
  const mafsNew = structureData(mafs);
  const egrNew = structureData(egr);

  await saveToJson('./', 'mafsNew.json', mafsNew);
  await saveToJson('./', 'egrNew.json', egrNew);
}

async function createExcelFromJSON(jsonPath, workSheetName) {
  const items = await parseJSONFile(jsonPath);
  const wb = new excel.Workbook();
  const ws = wb.addWorksheet(workSheetName);
  const headers = ['Бренд', 'Артикул', 'Бренд аналог', 'Артикул аналог'];
  const headerStyle = wb.createStyle({
    font: { bold: true },
  });
  headers.forEach((header, index) => {
    ws.cell(1, index + 1)
      .string(header)
      .style(headerStyle);
  });
  let rowIndex = 2;
  items.forEach(item => {
    item.analog.forEach(it => {
      const key = Object.keys(it)[0];
      it[key].forEach(num => {
        ws.cell(rowIndex, 1).string(item.brandMain || '');
        ws.cell(rowIndex, 2).string(item.skuMain || '');
        ws.cell(rowIndex, 3).string(key || '');
        ws.cell(rowIndex, 4).string(num || '');
        rowIndex++;
      });
    });
  });
  const outputExcel = `./${workSheetName}.xlsx`;
  wb.write(outputExcel, err => {
    if (err) {
      console.error('Помилка при створенні файлу Excel:', err);
    } else {
      console.log(`Файл Excel ${workSheetName}.xlsx успішно створений.`);
    }
  });
}

function structureData(arr) {
  return arr.map(item => {
    const analog = [];
    for (const key in item) {
      if (key !== 'QAP' && key !== 'Штрих-коди') {
        const newObj = {};
        newObj[key] = String(item[key]).split('\n');
        analog.push(newObj);
      }
    }
    return { brandMain: 'QAP', skuMain: item['QAP'], analog };
  });
}

// first()

createExcelFromJSON('./mafsFinal.json', 'mafs');

async function getbrandByOEnumber(jsonPath, filteredDesc, resultFileName) {
  const items = await parseJSONFile(jsonPath);
  const results = [];
  const errorArr = [];
  for (let idx = 0; idx < items.length; idx++) {
    if (idx % 20 === 0) {
      console.log('CHANGE IP');
      await delay(20000);
    }
    const item = items[idx];
    const findOEobj = item.analog.find(it => Object.keys(it)[0] === 'OE');
    if (!findOEobj) {
			results.push(item);
      continue;
    }
		const analog = item.analog.filter(it => Object.keys(it)[0] !== 'OE');
    const oe = findOEobj['OE'];
    const oeNew = [];
    console.log(oe.length);
    for (let idxOE = 0; idxOE < oe.length; idxOE++) {
      const oeNumber = oe[idxOE];
      try {
        const {
          data: {
            result: { products },
          },
        } = await axios.get(
          `https://exist.ua/api/v1/fulltext/search/?query=${oeNumber}&short=true`,
          {
            headers: {
              accept: 'application/json, text/plain, */*',
              'accept-language': 'ru',
              baggage:
                'sentry-environment=production,sentry-release=v2024.18.1,sentry-public_key=6541b6a63473425d99519d634760bb1a,sentry-trace_id=97fd21bce12a43648926b18aa5a05f95',
              'cache-control': 'no-cache',
              'client-render': '1',
              'old-session-enabled': '0',
              'page-url': '/search/',
              pragma: 'no-cache',
              priority: 'u=1, i',
              'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'sentry-trace': '97fd21bce12a43648926b18aa5a05f95-b07a3acf545c59cb',
              'x-csrftoken': 'X2AnY1GGGHZn6TFwU2ZGod2hr3gY3zfcgXT45MmNaITqhZiN18G6BGwxKaeDzefG',
              'x-ipa':
                'b46a1601b8356a01f618e70203f5b9598a79c3562a7eaa535740b74ac9d18a9821f2dc17357f6c3abba2f81aa879b0ab361171f06f495c65e2a583aa17c16aec',
            },
            referrerPolicy: 'no-referrer-when-downgrade',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
          }
        );
        if (!products || products.length === 0) {
          if (!oeNew.includes(oeNumber)) {
            oeNew.push(oeNumber);
          }
          continue;
        }
        const prodBrand = products.filter(
          it =>
            it.description === filteredDesc 
				// 	||
        //     it.description === 'Радиатор охлаждения отработанных газов' 
				// 	||
        //     it.description.toLowerCase().trim().includes('газов')
        //  ||
        //     it.description.toLowerCase().trim().includes('клапан')
        //  ||
        //     it.description.toLowerCase().trim().includes('egr')
        );
        if (prodBrand.length === 0) {
          if (!oeNew.includes(oeNumber)) {
            oeNew.push(oeNumber);
          }
          continue;
        }
        prodBrand.forEach(prod => {
          const brand = prod.trademark.description.toLowerCase();
          const findObjAtAnalog = analog.findIndex(
            it => Object.keys(it)[0].toLowerCase() === brand
          );
          if (findObjAtAnalog !== -1) {
            const key = Object.keys(analog[findObjAtAnalog]);
            if (!analog[findObjAtAnalog][key].includes(oeNumber)) {
              analog[findObjAtAnalog][key].push(oeNumber);
            }
          } else analog.push({ [brand.toUpperCase()]: [oeNumber] });
        });
        console.log(oeNumber);
        await delay(1000);
      } catch (error) {
        console.log(error);
				if (!oeNew.includes(oeNumber)) {
					oeNew.push(oeNumber);
				}
        // errorArr.push({ sku: item.skuMain, oe: oeNumber });
        continue;
      }
    }
    if (oeNew.length > 0) {
      analog.push({ OE: oeNew });
    }
    results.push({ ...item, analog });
    console.log(idx + 1, 'of', items.length);
    await delay(4000);
  }
  await saveToJson('./', resultFileName, results);
  // if (errorArr.length > 0) {
  //   await saveToJson('./', 'errorArr.json', errorArr);
  // }
}

// await getbrandByOEnumber(
//   './egrFinal_.json',
//   'Клапан рециркуляции отработанных газов EGR',
//   'egrFinal.json'
// );
// await getbrandByOEnumber('./mafsNew.json', 'Датчик массового расхода воздуха','mafsFinal.json');
