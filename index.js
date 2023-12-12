//引入相关资源包
var fs = require("fs");
var path = require("path");
var request = require("request");
const glob = require("glob");

function isJsonStr(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 *
 * @param {*} url  网络文件url地址
 * @param {*} fileName 	文件名
 * @param {*} dir 下载到的目录
 */
async function downloadFileByUrl(url, fileName, dir = "./") {
  return new Promise((resolve, reject) => {
    let stream = fs.createWriteStream(path.join(dir, fileName));
    request(url, async function (err, res, body) {
      if (err) {
        console.log(err);
      }
      console.log(res.statusCode);
      if (!isJsonStr(body)) {
        await downloadFileByUrl(
          url.replace("_full.json", ".json"),
          fileName,
          dir
        );
      }
    })
      .pipe(stream)
      .on("close", function (err) {
        console.log("文件" + fileName + "下载完毕");
        if (err) reject(err);
        resolve();
      });
  });
}

/** 获取文件列表 */
function readAllFilesInDir(dir) {
  const pattern = dir + "/**/*"; // 匹配文件夹及其子文件夹中的所有文件
  const files = glob.sync(pattern);
  return files;
}

/** 获取文件目录下json内容 */
function readJsonFile(file) {
  const content = fs.readFileSync(file, "utf-8");
  return JSON.parse(content);
}

function downloadGeoJson(dir, outDir) {
  const files = readAllFilesInDir(dir);
  console.log(files);
  files.forEach((file) => {
    const fileName = path.basename(file);
    const dir = path.dirname(file);
    const json = readJsonFile(file);
    const features = json.features;
    console.log("🚀 ~ file: index.js:47 ~ files.forEach ~ features:", features);
    features.forEach(async (item) => {
      console.log(item.properties.adcode);
      let downloadUrl = `https://geo.datav.aliyun.com/areas_v3/bound/${item.properties.adcode}_full.json`;
      console.log(downloadUrl);
      await downloadFileByUrl(
        downloadUrl,
        `${item.properties.adcode}.json`,
        outDir
      );
    });
  });
}

// 下载china geoJson
// downloadFileByUrl(
//   "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
//   "100000.json",
//   "./country"
// );

// 下载各省geoJson
// downloadGeoJson("./country", "./province");

//下载城市geoJson
downloadGeoJson("./province", "./city");
