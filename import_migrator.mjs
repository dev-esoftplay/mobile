import fs from 'fs'
const pattern = new RegExp(/\n{0,}import ((.*)) from (?:"esoftplay"|'esoftplay');?/gm)
const globalPattern = new RegExp(/((?:, useGlobalState|useGlobalState,|\{\s{0,}useGlobalState\s{0,}\}))/gs)
if (fs.existsSync('./modules')) {
  fs.readdirSync('./modules').forEach((module) => {
    if (!module.startsWith('.')) {
      fs.readdirSync('./modules/' + module).forEach((task) => {
        var dFile = fs.readFileSync('./modules/' + module + '/' + task, { encoding: 'utf8' })
        const matchs = dFile.match(pattern)
        const matchGlobal = dFile.match(globalPattern)
        if (matchs) {
          let espMod = []
          let nonEspMod = []
          const cmatch = matchs[0]
          const arrModules = cmatch.substring(cmatch.indexOf('{') + 1, cmatch.lastIndexOf('}')).split(',')
          arrModules.forEach((mod) => {
            const modTrim = mod.trim()
            if (modTrim.match(/^(?:_|[a-z])/g)) {
              console.log("+  : " + modTrim)
              espMod.push(modTrim)
            } else {
              nonEspMod.push(modTrim)
              console.log("-  : " + modTrim)
            }
          })
          let adder = ""
          if (nonEspMod.length > 0) {
            nonEspMod.forEach((non) => {
              if (non) {
                const [module, task] = non.split(/(?=[A-Z])/)
                if (module && task)
                  adder += `import { ${non} } from 'esoftplay/cache/${module.toLowerCase()}/${task.toLowerCase()}/import';\n`
              }
            })
          }
          dFile = dFile.replace(cmatch, "\nimport { " + espMod.join(", ") + " } from 'esoftplay';\n" + adder)
          // if (matchGlobal) {
          //   dFile = dFile.replace(matchGlobal, "")
          //   dFile = dFile.replace("\n", "\nimport useGlobalState from 'esoftplay/global';\n")
          // }
          fs.writeFileSync('./modules/' + module + '/' + task, dFile, { encoding: 'utf8' })
        }
      })
    }
  })
}
