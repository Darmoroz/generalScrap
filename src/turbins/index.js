import axios from 'axios';

import { parseJSONFile } from '../commonUtils/parseJSONFile.js';

const jsonFilePath='./inData/jroneSkuFirst.json'

async function getLinksEachPage(jsonPath) {
	const items= await parseJSONFile(jsonPath)

	console.log()
}

getLinksEachPage(jsonFilePath)