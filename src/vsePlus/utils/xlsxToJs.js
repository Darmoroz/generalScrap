import xlsx from "xlsx";
import { saveToJson } from "../../commonUtils/saveToJson.js";



export async function xlsxToJs(fileName) {
	const workbook = xlsx.readFile(fileName);
	const sheetName = workbook.SheetNames[0];
	const worksheet = workbook.Sheets[sheetName];
	const jsData = xlsx.utils.sheet_to_json(worksheet);
	return jsData
}
