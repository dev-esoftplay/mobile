const fs = require('fs')
const merge = require('lodash/merge')

function readAsJson(path) {
  let out = ""
  try { out = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' })) } catch (e) { }
  return out;
}
if (!fs.existsSync("./assets/locale/id.json")) {
  fs.writeFileSync("./assets/locale/id.json", JSON.stringify({}, undefined, 2))
}
if (fs.existsSync("./assets/locale/id.json")) {
  let masterLocale = readAsJson('./node_modules/esoftplay/assets/locale/id.json')
  let projectLang = readAsJson("./assets/locale/id.json")
  let _lg = merge(masterLocale, projectLang)
  masterLocale = { ..._lg }
  fs.writeFileSync("./assets/locale/id.json", JSON.stringify(masterLocale, undefined, 2))
}