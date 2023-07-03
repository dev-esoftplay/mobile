const fs = require('fs');
const shell = require('child_process').execSync;
const merge = require('lodash/merge')
const assetsFonts = "assets/fonts"
let args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Argumen tidak boleh kosong");
  return
}

const mainModule = args[0]
const moduleName = args[0]?.split("-")?.[1]

/* copy directory */
if (fs.existsSync('../esoftplay/esp.ts')) {
  if (fs.existsSync('../esoftplay/modules/' + moduleName))
    shell('rm -r ../esoftplay/modules/' + moduleName)
  shell("cp -r ../" + mainModule + "/" + moduleName + " ../esoftplay/modules/")
} else {
  throw "Mohon install esoftplay package terlebih dahulu"
}

function readAsJson(path) {
  let out = ""
  try {
    out = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))
  } catch (e) {

  }
  return out;
}

function injectConfig(configPath) {
  if (fs.existsSync(configPath)) {
    const config = "../" + mainModule + "/config.json"
    const exsConf = readAsJson(configPath)
    const conf = readAsJson(config)
    let _cf = merge({ config: conf }, exsConf)
    fs.writeFileSync(configPath, JSON.stringify({ ..._cf }, undefined, 2))
  }
}

/* injectConfig */
injectConfig("../../config.json")
injectConfig("../../config.live.json")
injectConfig("../../config.debug.json")

/* move assets */
if (fs.existsSync("../" + mainModule + "/assets/")) {
  console.log("ADA ASSETS");
  if (!fs.existsSync("../../assets/" + moduleName))
    shell("mkdir -p ../../assets/" + moduleName)
  try {
    shell("cp -r -n ../" + mainModule + "/assets/* ../../assets/" + moduleName + "/")
  } catch (error) { }
}

if (fs.existsSync("../" + mainModule + "/fonts/")) {
  console.log("ADA FONTS");
  if (!fs.existsSync("../../" + assetsFonts))
    shell("mkdir -p ../../" + assetsFonts)
  try {
    shell("cp -r -n ../" + mainModule + "/fonts/* ../../" + assetsFonts + "/")
  } catch (error) { }
}

/* inject lang */
if (fs.existsSync("../" + mainModule + "/id.json")) {
  let moduleLang = readAsJson("../" + mainModule + "/id.json")
  if (fs.existsSync("../../assets/locale/id.json")) {
    let projectLang = readAsJson("../../assets/locale/id.json")
    let _lg = merge(moduleLang, projectLang)
    moduleLang = { ..._lg }
  }
  fs.writeFileSync("../../assets/locale/id.json", JSON.stringify(moduleLang, undefined, 2))
}

/* inject libs */
if (fs.existsSync("../" + mainModule + "/libs.json")) {
  let libs = readAsJson("../" + mainModule + "/libs.json")
  let libsToSkip = []
  libs.forEach((element, index) => {
    console.log(element.split("@")[0])
    if (fs.existsSync("../../node_modules/" + element.split("@")[0])) {
      libsToSkip.push(element)
    }
  })
  if (libsToSkip.length > 0) {
    libsToSkip.forEach((lib) => {
      libs = libs.filter((x) => x != lib)
      console.log(lib + " is exist, Skipped")
    })
  }
  if (libs.length > 0) {
    console.log("mohon tunggu ..")
    console.log("installing \\n" + libs.join("\\n"))
    shell("cd ../../ && expo install " + libs.join(" && expo install "))
  }
  console.log("Success..!")
}

/* execute mover on master */
if (fs.existsSync("../" + mainModule + "/mover.js")) {
  shell("node ../" + mainModule + "/mover.js", { stdio: 'inherit' })
}