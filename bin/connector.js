const fs = require('fs')

if (fs.existsSync('./raw/connected.json')) {
  const { source, modules } = JSON.parse(fs.readFileSync('./raw/connected.json'))
  const currentProject = './node_modules/esoftplay/modules/';

  if (source) {
    if (modules.length > 0) {
      modules.forEach((module) => {
        const ext = [
          '.ts',
          '.tsx',
          '.js',
          '.debug.ts',
          '.debug.tsx',
          '.debug.js',
          '.live.ts',
          '.live.tsx',
          '.live.js',
        ]
        ext.forEach((fext) => {
          const _source = source + "/modules/" + module + fext;
          const _destination = currentProject + module + fext;

          if (fs.existsSync(_source)) {
            const file = fs.readFileSync(_source, { encoding: 'utf8' })
            const [mod] = module.split('/')
            if (!fs.existsSync(currentProject + mod)) {
              fs.mkdirSync(currentProject + mod)
            }
            fs.writeFileSync(_destination, file, { encoding: 'utf8' })
            console.log('>_ ' + module + fext + ' connected from ' + source)
          }
        })
      })
    }
  }
}