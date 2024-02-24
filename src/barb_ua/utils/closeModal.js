import chalk from 'chalk';

export async function closeModal(page) {
  try {
    const isBlockTg = await page.evaluate(() => {
      const wereHereEl = document.querySelector('#were_here');
      const backdropEl = document.querySelectorAll('.modal-backdrop');

      if (wereHereEl) {
        wereHereEl.style.display = 'none';
      }
      if (backdropEl) {
        backdropEl.forEach(el => (el.style.position = 'relative'));
      }
      const elementTg = document.querySelector('#telegram_bot_modal');
      const isBlockTg = elementTg.style.display === 'block';
      return isBlockTg;
    });
    if (isBlockTg) {
      const closeBtn = await page.$('#telegram_bot_modal .close');
      if (closeBtn) {
        closeBtn.click();
      }
    }
  } catch (error) {
    console.log('close modal', chalk.red(error));
  }
}
