import fs from 'fs/promises';
import yaml from 'js-yaml';
import got from 'got';

const templateDir = 'https://github.com/coollabsio/coolify/raw/next/apps/api/devTemplates.yaml'
const data = await got.get(templateDir).text()
const json = yaml.load(data)
for (const template of json) {
    const type = template.type
    const file = `./services/templates/${type}.yaml`
    const data = yaml.dump(template)
    await fs.writeFile(file, data)
}

