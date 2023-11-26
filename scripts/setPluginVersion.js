import fs from 'fs'

const path = './plugins/litapp/blog/plugin.info'

const version = JSON.parse(fs.readFileSync('./package.json')).version
const pluginInfo = JSON.parse(fs.readFileSync(path))

console.log(version)

if (!version) {
    process.exit(1)
}

pluginInfo.version = version

fs.writeFileSync(path, JSON.stringify(pluginInfo, ' ', 4))
