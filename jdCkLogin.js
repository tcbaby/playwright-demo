const { chromium, devices } = require("playwright-chromium");
const phone = devices['iPhone 13 Pro']
require('dotenv').config();

const ck = process.env.ck;

const waitTime = 100;
const url = "https://home.m.jd.com";

!(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const context = await browser.newContext({ ...phone });
    const page = await context.newPage();

    await page.context().addCookies(getCookies(ck))

    await page.goto(url, { timeout: 120000 });
    await page.waitForTimeout(waitTime);

    await page.addListener('close', async () => await browser.close())
})();

function getCookies(ck) {
    const buildCookie = (name, value) => {
        return {
            sameSite: 'Lax',
            name: name,
            value: value,
            domain: '.jd.com',
            path: '/',
            // expires: 1645420969.120811,
            httpOnly: true,
            secure: false
        }
    }
    const pin = ck.match(/pt_pin=(.*?)[; ]/)[1]
    const key = ck.match(/pt_key=(.*?)[; ]/)[1]
    return [buildCookie('pt_pin', pin), buildCookie('pt_key', key)];
}