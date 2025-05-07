//@ts-check
const fs = require('fs')
const idJsonPath ="./assets/locale/id.json"

function readAsJson(path) {
  let out = ""
  try { out = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' })) } catch (e) { }
  return out;
}
if (!fs.existsSync("./assets/locale")) {
  fs.mkdirSync("./assets/locale")
}
if (!fs.existsSync(idJsonPath)) {
  fs.writeFileSync(idJsonPath, JSON.stringify({}, undefined, 2))
}
if (fs.existsSync(idJsonPath)) {
  let masterLocale = readAsJson('./node_modules/esoftplay/assets/locale/id.json')
  let projectLang = readAsJson(idJsonPath)
  let _lg = mergeDeep(masterLocale, projectLang)
  masterLocale = { ..._lg }
  fs.writeFileSync(idJsonPath, JSON.stringify(sortObject(masterLocale), undefined, 2), { encoding: 'utf8' })
}

function sortObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  let sortedKeys = Object.keys(obj).sort();
  let sortedObj = {};

  for (let key of sortedKeys) {
    sortedObj[key] = sortObject(obj[key]);
  }

  return sortedObj;
}

function mergeDeep(target, ...sources) {
  target = Object(target);
  for (const source of sources) {
    const sourceObj = Object(source);
    for (const [key, value] of Object.entries(sourceObj)) {
      if (value ?? null !== null) {
        if (value !== null && typeof value === "object") {
          target[key] = mergeDeep(target[key] ?? {}, value);
        } else {
          target[key] = value;
        }
      }
    }
  }
  return target;
}