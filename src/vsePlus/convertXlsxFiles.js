import { saveToJson } from '../commonUtils/saveToJson.js';
import { xlsxToJs } from './utils/xlsxToJs.js';
import { getFilesPath } from './utils/getFilesPath.js';

const XLSX_DIR = 'xlsx';

async function main(xlsxDir) {
  const files = await getFilesPath(xlsxDir);
  for (let idxFiles = 0; idxFiles < files.length; idxFiles++) {
    const file = files[idxFiles];
    const jsFileData = await xlsxToJs(file);
    // if (file.includes('ua.')) {
    //   jsFileData.forEach(it=>{
    //     it.imgCatalog=it.imgs.split(';')
    //   })
    // }
    await saveToJson('', file.replace('.xlsx', ''), jsFileData);
  }
}

main(XLSX_DIR);

function removeDuplicateSubstrings(value) {
  const parts = value.split(' / ');
  const uniqueParts = [...new Set(parts)];
  return uniqueParts.join(' / ');
}
