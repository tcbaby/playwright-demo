const fs = require("fs");
const path = require("path");
const { firefox } = require("playwright");
const cheerio = require("cheerio");
const axios = require("axios");
const process = require("child_process");
const { promisify } = require("util");

const exec = promisify(process.exec);

const waitTime = 500;
const maxPage = 20;
const bingUrlPrefix = "https://www.bing.com/images/search?q=";
const downDir = "./out";
await exec(`if [ ! -d ${downDir}} ]; then mkdir -p ${downDir} ; fi`);

const downImage = async (imageUrl, imagename) => {
  const res = await axios.get(imageUrl, { responseType: 'arraybuffer' })

  let file = path.resolve(downDir, imagename);
  fs.writeFileSync(file, new Buffer.from(res.data), "binary");
};

const trans = async (data) => {
  let res = (await exec(`trans -brief '${data}'`)).stdout;
  res = res.substring(0, res.length - 1);
  return res;
};

const main = async (keyword) => {
  const browser = await firefox.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ size: { width: 770, height: 480 } });
  await page.goto(bingUrlPrefix + keyword, { timeout: 120000 });
  await page.waitForTimeout(waitTime);

  for (let i = 0; i < maxPage; ++i) {
    console.log(`page: ${i + 1}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(waitTime);
  }

  fs.writeFileSync(
    "datas.csv",
    "序号,标题,标题（中）,描述,描述（中）,图片地址,文章地址\n"
  );

  const content = await page.content();
  const $ = cheerio.load(content);
  $(".iusc").each(async (i, elem) => {
    let dataJson = $(elem).attr("m");
    let data = JSON.parse(dataJson);
    let url = data.murl;
    // 去掉乱码
    let title = data.t
      .replace(/[^-|^（|^）|^\d|^\[a-zA-Z\]|^\[\u4e00-\u9fa5\]]/g, " ")
      .replace(/\ +/g, " ");
    let desc = data.desc;

    let titleCh = await trans(title);
    let descCh = await trans(desc);

    fs.writeFileSync(
      "datas.csv",
      `${i + 1},${title},${titleCh},${desc},${descCh},${url}, ${data.purl}\n`,
      { flag: "a+" }
    );

    if (url) {
      console.log(titleCh + ".jpg");
      console.log(`url${i}: ${url}`);
      await downImage(url, `${i + 1}.${titleCh}.jpg`);
    }
  });

  await browser.close();
};

main("uav")