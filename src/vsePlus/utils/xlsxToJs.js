import xlsx from 'xlsx';
import { saveToJson } from '../../commonUtils/saveToJson.js';

export async function xlsxToJs(fileName) {
  const workbook = xlsx.readFile(fileName);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // const jsData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const jsData = xlsx.utils.sheet_to_json(worksheet, {defval:'' });
  
  // Отримання кількості рядків і стовпців
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const rowCount = range.e.r - range.s.r + 1;
    const colCount = range.e.c - range.s.c + 1;
    const firstRow = jsData[0];

  // return [jsData, firstRow, {headers:firstRow, col:colCount, row:rowCount}];
  return jsData;
}
