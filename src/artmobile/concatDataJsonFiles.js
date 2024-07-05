import { getFilesPathFromDirectory } from '../commonUtils/getFilesPathFromDirectory.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';

const folderPath = 'tempJs';
const resultFileName = 'artMob';

async function main(initFolderPath, resultFileName) {
  const filesPath = await getFilesPathFromDirectory(initFolderPath);
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

  try {
    await saveToJson('./', resultFileName, results);
  } catch (err) {
    console.log('error save results', err);
  }
}

main(folderPath, resultFileName);
