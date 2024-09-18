import { saveToJson } from '../commonUtils/saveToJson.js';
import { xlsxToJs } from './utils/xlsxToJs.js';
import { getFilesPath } from './utils/getFilesPath.js';

const XLSX_DIR = 'xlsx';

async function main(xlsxDir) {
  const filesAll = await getFilesPath(xlsxDir);
  const headersAllUa=[]
  const headersAllRu=[]
  // const files= filesAll.filter(it=>it.includes('-ua'))
  // for (let idxFiles = 0; idxFiles < files.length; idxFiles++) {
  for (let idxFiles = 0; idxFiles < filesAll.length; idxFiles++) {
    const file = filesAll[idxFiles];
    const jsFileData= await xlsxToJs(file)

//     const fileUa = files[idxFiles];
//     const fileRu=fileUa.replace('-ua','-ru')
//     const [jsFileDataUa, headersUa, infoUa] = await xlsxToJs(fileUa);
//     const [jsFileDataRu, headersRu, infoRu] = await xlsxToJs(fileRu);
//     headersAllUa.push(...headersUa)
//     headersAllRu.push(...headersRu)
    
// if (file.includes('ua.')) {
    //   jsFileData.forEach(it=>{
    //     it.imgCatalog=it.imgs.split(';')
    //   })
    // }

    await saveToJson('', file.replace('.xlsx', ''), jsFileData);

    // await saveToJson('', fileUa.replace('.xlsx', ''), jsFileDataUa);
    // await saveToJson('', fileRu.replace('.xlsx', ''), jsFileDataRu);
    // await saveToJson('', 'headersAllUa', [...new Set(headersAllUa)]);
    // await saveToJson('', 'headersAllRu', [...new Set(headersAllRu)]);
    // const fileUaSplit=fileUa.split('\\')
    // await saveToJson('', fileUaSplit[fileUaSplit.length-1],{ua:infoUa, ru:infoRu})
  }
}

main(XLSX_DIR);

function removeDuplicateSubstrings(value) {
  const parts = value.split(' / ');
  const uniqueParts = [...new Set(parts)];
  return uniqueParts.join(' / ');
}
