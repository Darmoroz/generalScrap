import fs from 'fs';
import { Parser } from 'json2csv';


const initJson='artMobil'

async function convertJsonToCsv(jsonFile) {
	const products= await parseJSONFile(jsonFile)
	products.forEach(it => {
		delete it.imgLinks
		delete it.link
		delete it.id
	});
	const allKeys = [...new Set(products.flatMap(obj => Object.keys(obj)))];
	const json2csvParser = new Parser({ fields: allKeys });
const csv = json2csvParser.parse(products);

fs.writeFile(`${initJson}.csv`, csv, (err) => {
  if (err) {
    console.error('Error writing to file', err);
  } else {
    console.log('CSV file has been saved');
  }
});
	console.log(allKeys.length)
}

main(initJson)












async function parseJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${filePath}.json`, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    });
  });
}
