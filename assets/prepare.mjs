import fs from 'fs'
fs.readdirSync("./modules", { encoding: 'utf8' }).forEach((module) => {
  fs.readdirSync("./modules/" + module, { encoding: 'utf8' }).forEach((task) => {
    console.log(task)
    const path = "./modules/" + module + "/" + task
    let file = fs.readFileSync(path, { encoding: 'utf8' })
    fs.writeFileSync(path, file.replace(/esoftplay\/libs\/worker/g, "../../assets/worker"), { encoding: 'utf8' })
  })
})
