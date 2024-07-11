import { getFilesPath } from './utils/getFilesPath.js';
import { parseJSONFile } from './utils/parseJSONFile.js';
import { saveToJson } from './utils/saveToJson.js';

const folderPath = 'tempJson';
const resultFileName = 'resHun';

async function main(initFolderPath, resultFileName) {
  const filesPath = await getFilesPath(initFolderPath);
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
    await saveToJson('./', resultFileName, uniqResults);
  } catch (err) {
    console.log('error save results', err);
  }
}

main(folderPath, resultFileName);
