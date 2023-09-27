//@ts-check
const fs = require('fs');

const param = process.argv[2]

if (param == 'clear') {
  console.log("DEACTIVATING FAST REFRESH...")
  fs.readdirSync('./modules/').forEach((module) => {
    if (fs.statSync('./modules/' + module).isDirectory()) {
      fs.readdirSync('./modules/' + module).forEach((task) => {
        let text = fs.readFileSync('./modules/' + module + '/' + task, { encoding: 'utf8' })
        const isHooks = (/\/\/\s{0,}withHooks/g).exec(text)
        const memoiz = (/\nexport default memo\(([a-zA-Z0-9]+)\)\;/g).exec(text)
        text = text.replace("\nimport { memo } from 'react';", "")
        if (isHooks && memoiz && memoiz.length > 1) {
          const [exdefCurrent, currentNameFunction] = memoiz
          text = text.replace(exdefCurrent, '')
          text = text.replace("function " + currentNameFunction + "(", "export default function " + currentNameFunction + "(")
        }
        fs.writeFileSync('./modules/' + module + '/' + task, text, { encoding: 'utf8' })
      })
    }
  })
} else {
  console.log("ACTIVATING FAST REFRESH...")
  fs.readdirSync('./modules/').forEach((module) => {
    if (fs.statSync('./modules/' + module).isDirectory()) {
      fs.readdirSync('./modules/' + module).forEach((task) => {
        let text = fs.readFileSync('./modules/' + module + '/' + task, { encoding: 'utf8' })
        const isHooks = (/\/\/\s{0,}withHooks/g).exec(text)
        if (isHooks) {
          const exdef = (/\nexport default function ([a-zA-Z0-9]+)\(/g).exec(text)
          if (exdef && exdef.length > 1) {
            const [exdefCurrent, currentNameFunction] = exdef
            text = text.replace('withHooks', "withHooks\nimport { memo } from 'react';")
            text = text.replace(exdefCurrent, "\nfunction " + currentNameFunction + '(')
            text = text + '\nexport default memo(' + currentNameFunction + ');'
            fs.writeFileSync('./modules/' + module + '/' + task, text, { encoding: 'utf8' })
          }
        }
      })
    }
  })
}