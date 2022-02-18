const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const waitTime = 1500;
const url = "https://kns.cnki.net/kns8/defaultresult/index";

!(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  await page.goto(url, { timeout: 120000 });
  await page.waitForTimeout(waitTime);

  const kw = '30772369';

  await page.fill('#txt_search', kw);
  await page.click('.sort-default');
  await page.click('div.search-box > div > div.search-main > div.input-box > div.sort.reopt > div.sort-list > ul > li:nth-child(10) > a');
  await page.click('.search-btn');
  await page.click('#selectCheckAll1');

  await page.click('#batchOpsBox > li:nth-child(2) > a');
  await page.click('#batchOpsBox > li:nth-child(2) > ul > li.export > a');
  await page.click('#batchOpsBox > li:nth-child(2) > ul > li.export > ul > li:nth-child(12) > a');

  await page.goto('https://kns.cnki.net/KNS8/manage/export.html?displaymode=selfDefine', { timeout: 120000 })
  await page.waitForTimeout(waitTime);
  await page.click('#result > div > div > a:nth-child(1)')

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#litoexcel')
  ]);
  const filePath = await download.path();
  fs.copyFileSync(filePath, path.join('./data/zhi.xls'))

  await page.addListener('close', async () => {
    clearInterval(intervalId)
    await browser.close()
  })
})();