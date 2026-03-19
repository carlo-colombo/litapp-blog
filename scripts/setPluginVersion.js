import fs from "fs";

const path = "./plugins/litapp/blog/plugin.info";

const versionFromArgs = process.argv[2];
const versionFromPackage = JSON.parse(fs.readFileSync("./package.json")).version;

const version = (versionFromArgs || versionFromPackage).replace(/^v/, "");

console.log(`Setting plugin version to: ${version}`);

if (!version) {
  process.exit(1);
}

const pluginInfo = JSON.parse(fs.readFileSync(path));
pluginInfo.version = version;

fs.writeFileSync(path, JSON.stringify(pluginInfo, null, 4) + "\n");
