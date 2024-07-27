import path, { basename } from 'path';
import { getFilesPath } from '../commonUtils/getFilesPath.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';

const initFilesDirectory = 'apllicabData/';
const resultsFiledirectory='./'
const resultsFileName='totalApllicab'


async function createApllicabXlsx(inFilesDir) {
  try {
    const files = await getFilesPath(inFilesDir);
    const results = [];
    let idxFile = 0;
    while (idxFile < files.length) {
    // while (idxFile < 1) {
      const filePathAbs = files[idxFile].replace(/\\/g, '/');
      const baseName = path.basename(filePathAbs,'.json');
			console.log(`filename->, ${baseName}.json`);
			const resultObj={sku:baseName.replaceAll('_',' ')}
      try {
        const itemData = await parseJSONFile(filePathAbs.replace('.json', ''));

				const brandsArr=[];
				const modelsArr=[]
				const yearsArr=[]
				const engineArr=[]
				const engineCapacityArr=[]
				itemData.forEach(brand=>{
					const brandName=brand?.description
					brandsArr.push(brandName)
					const brandModels=brand?.models
					brandModels?.forEach(mod=>{
						const model=mod?.description
						modelsArr.push(model)
						const years=`${mod?.year_start?.split('-')?.[0]}-${mod?.year_end?.split('-')?.[0]}`
						yearsArr.push(years)
						const modelsType=mod?.model_type_list
						modelsType?.forEach(modelType=>{
							const modificationsList=modelType?.modification_list
							modificationsList?.forEach(modification=>{
								const engineType=modification?.attributes?.engine_type
								const engineCapacity=modification?.attributes?.capacity?.replace('Л','')?.trim()
								engineArr.push(engineType)
								engineCapacityArr.push(engineCapacity)
							})
						})
					})
				})
				resultObj.brands=[...new Set(brandsArr)].filter(Boolean).join(',')
				resultObj.models=[...new Set(modelsArr)].filter(Boolean).join(',')
				resultObj.years=[...new Set(yearsArr)].filter(Boolean).join(',')
				resultObj.engine=[...new Set(engineArr)].filter(Boolean).join(',')
				resultObj.engineCapacity=[...new Set(engineCapacityArr)].filter(Boolean).join(',')
				results.push(resultObj)
				idxFile++;
      } catch (error) {
        console.log(`parse error file -> ${filePathAbs}`);
				console.log(error)
      }
    }
		try {
			await saveToJson(resultsFiledirectory, resultsFileName, results)
		} catch (error) {
			console.log(`saveJson error -> ${resultsFileName}`)
		}
  } catch (error) {
    console.log(`read error directory -> ${path.resolve(inFilesDir)}`);
  }
}

await createApllicabXlsx(initFilesDirectory);
