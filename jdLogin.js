const { chromium, webkit, devices } = require("playwright");
const phone = devices['iPhone 13 Pro']
require('dotenv').config();

const waitTime = 100;
const url = "https://home.m.jd.com";

const user = process.env.user
const pass = process.env.pass

!(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ ...phone });
  const page = await context.newPage();
  await page.goto(url, { timeout: 120000 });
  await page.waitForTimeout(waitTime);

  await page.click('.quick-btn .planBLogin')
  await page.click('.policy_tip-checkbox')
  await page.fill('#username', user)
  await page.fill('#pwd', pass)
  await page.click('a.J_ping')

  const intervalId = setInterval(async () => {
    const cookies = await page.context().cookies()
    const ck = cookies.filter(c => c.name === 'pt_pin' || c.name === 'pt_key')
      .map(c => `${c.name}=${c.value};`).join()
    if (ck) {
      console.log(ck);
      await page.context().clearCookies();
      await page.reload();
      await page.waitForTimeout(waitTime);
    }
  }, 1000)

  await page.addListener('close', async () => {
    clearInterval(intervalId)
    await browser.close()
  })
})();