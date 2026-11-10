const fs = require('fs');
const shell = require('child_process').execSync;

if (fs.existsSync('./node_modules')) {
  fs.readdirSync('./node_modules').forEach((module) => {
    if (module.includes("esoftplay-")) {
      const [prefix, name] = module.split("-")
      if (!fs.existsSync(`./node_modules/esoftplay/modules/${name}`) && name != 'dev') {
        shell(`cp -R ./node_modules/${module}/${name} ./node_modules/esoftplay/modules/`)
      }
      if (fs.existsSync(`./node_modules/${module}/mover.js`))
        shell(`cd ./node_modules/${module} && node mover.js && cd ../../`)
      shell(`cd ./node_modules/${module} && bun install && cd ../../`)
    }
  })
}