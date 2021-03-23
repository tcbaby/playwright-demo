const process = require("child_process");
const { promisify } = require("util");

const exec = promisify(process.exec);

const downDir = './out'

async function main() {
  let datas = (await exec("cat datas.csv")).stdout.split("\n");
  for (let i = 1; i < datas.length - 1; ++i) {
    let data = datas[i].split(",");
    let url = data[5];
    let imagename = `${downDir}/${data[0]}.${data[2]}.jpg`;
    const cmd = `wget -t3 -T30 '${url}' -O '${imagename}' || rm -f '${imagename}'`;
    console.log(cmd);
    exec(cmd);
  }
}

main();
