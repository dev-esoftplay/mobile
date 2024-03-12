const fs = require('fs')

let functions = []
if (fs.existsSync('./worker')) {
  fs.readdirSync('./worker').forEach((file) => {
    functions.push(fs.readFileSync('./worker/' + file).toString())
  })
}
fs.writeFileSync('./node_modules/esoftplay/modules/lib/out.js', "// useLibs //noPage \n\nmodule.exports = \`\n" + functions.join('\n') + "\n\`")