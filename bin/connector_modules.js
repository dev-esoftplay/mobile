const fs = require('fs')

if (fs.existsSync('./config.json')) {
  const config = JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf8' }))
  const currentProject = './modules/';

  if (config.config.connected_modules) {
    if (config.config.connected_modules.length > 0) {
      config.config.connected_modules.forEach((path) => {
        const modules = JSON.parse(fs.readFileSync(path + '/raw/connected_modules.json', { encoding: 'utf8' }))
        modules.forEach((module) => {
          console.log('>_ connecting.. ' + module)
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
            const source = currentProject + module + fext;
            const destination = path + "/modules/" + module + fext;

            if (fs.existsSync(source)) {
              const file = fs.readFileSync(source, { encoding: 'utf8' })
              const [mod, task] = module.split('/')
              if (!fs.existsSync(path + '/modules/' + mod)) {
                fs.mkdirSync(path + '/modules/' + mod)
              }
              fs.writeFileSync(destination, file, { encoding: 'utf8' })
            }
          })
        })
      })
    }
  }
}