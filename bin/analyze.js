const fs = require('fs');

const importer = `\nimport useRenderCounter from 'esoftplay/render';`
const hook = (module) => `\n\tconst RC = useRenderCounter('${module}')`
const tag = `\t\t\t<RC />\n`
const param = process.argv[2]

if (param == 'clear') {
  fs.readdirSync('./modules/').forEach((module) => {
    if (fs.statSync('./modules/' + module).isDirectory()) {
      fs.readdirSync('./modules/' + module).forEach((task) => {
        let text = fs.readFileSync('./modules/' + module + '/' + task, { encoding: 'utf8' })
        text = text.replace(importer, "")
        text = text.replace(hook(module + '/' + task), "")
        text = text.replace(tag, "")
        fs.writeFileSync('./modules/' + module + '/' + task, text, { encoding: 'utf8' })
      })
    }
  })
} else {

  fs.readdirSync('./modules/').forEach((module) => {
    if (fs.statSync('./modules/' + module).isDirectory()) {
      fs.readdirSync('./modules/' + module).forEach((task) => {
        let text = fs.readFileSync('./modules/' + module + '/' + task, { encoding: 'utf8' })
        const importText = (/\n(import .*)\n/g).exec(text)
        if (importText && importText.length > 1) {
          const firstImport = importText[1]
          text = text.replace(importer, "")
          text = text.replace(firstImport, firstImport + importer)
          const hooks = (/\n(export default function.*)\n/g).exec(text)
          if (hooks && hooks.length > 1) {
            const mainFunction = hooks[1]
            text = text.replace(hook(module + '/' + task), "")
            text = text.replace(mainFunction, mainFunction + hook(module + '/' + task))
            let subText = (/(export default function.*\n})/gs).exec(text)
            const render = (/(\n\s{2}return.*\n.*\>\n)/g).exec(subText)
            if (subText && subText.length > 1 && render && render.length > 1) {
              const mainRender = render[1]
              let newSubText = subText[1].replace(tag, "")
              newSubText = newSubText.replace(mainRender, mainRender + tag)
              text = text.replace(subText[1], newSubText)
              fs.writeFileSync('./modules/' + module + '/' + task, text, { encoding: 'utf8' })
            }
          }
        } else {
          console.log('SKIP => ' + module + '/' + task)
        }
      })
    }
  })
}