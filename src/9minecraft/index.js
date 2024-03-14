import chalk from 'chalk';
// import { getUrls } from './utils/getUrls.js';
//* import { getModInfo } from './utils/getModInfo.js';
//? import { downloadImg } from './utils/downloadImg.js';
//? import { mods } from './tempData/mods.js';
import { downloadMods } from './utils/downloadMods.js';
import { modsPreview } from './tempData/modsPreview.js';

async function main() {
  try {
    // await getUrls();
    //* await getModInfo();
    //? await downloadImg(mods);
    await downloadMods(modsPreview);
  } catch (error) {
    console.log('main', chalk.red(error));
  }
}

await main();
