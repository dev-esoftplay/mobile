// @ts-check

import fs from 'fs'
if (fs.existsSync('./modules')) {
  fs.readdirSync('./modules').forEach((module) => {
    if (!module.startsWith('.')) {
      fs.readdirSync('./modules/' + module).forEach((task) => {
        var dFile = fs.readFileSync('./modules/' + module + '/' + task, { encoding: 'utf8' })
        // if (module == 'artist' && task == 'detail.tsx') {
        dFile = dFile.replace(/esoftplay\/cache\/([a-z0-9_]+\/[a-z0-9_]+).import/g, "esoftplay/cache/$1/import")
        console.log(module + '/' + task)
        // }
        fs.writeFileSync('./modules/' + module + '/' + task, dFile, { encoding: 'utf8' })
      })
    }
  })
}
