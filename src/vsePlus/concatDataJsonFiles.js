import { getFilesPathFromDirectory } from '../commonUtils/getFilesPathFromDirectory.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';

// const folderPath = 'data/products';
const folderPath = 'xlsx';
const resultFileName = 'tools_ru';

async function main(initFolderPath, resultFileName) {
  const filesPathAll = await getFilesPathFromDirectory(initFolderPath);
  const filesPath= filesPathAll.filter(it=>it.includes('-ru'))
console.log(filesPath.length)
  const results = [];
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filepath = filesPath[idx];
    try {
      const data = await parseJSONFile(filepath.replace(/.json/g, ''));
      results.push(...data);
    } catch (err) {
      console.log('error parse json file', err);
    }
  }

  const uniqResults = [...new Set(results)];
  try {
    await saveToJson('./', resultFileName, results);
  } catch (err) {
    console.log('error save results', err);
  }
}

main(folderPath, resultFileName);
