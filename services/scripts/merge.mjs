import fs from 'fs/promises';
import yaml from 'js-yaml';

const templateDir = './services/templates'
const dir = await fs.readdir(templateDir)
const templates = []
for (const file of dir) {
    const template = await fs.readFile(`${templateDir}/${file}`, 'utf8')
    templates.push(yaml.load(template))
}
await fs.writeFile('./output/service-templates.yaml', yaml.dump(templates))

