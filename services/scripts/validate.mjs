import { z } from "zod";
import fs from 'fs/promises';
import yaml from 'js-yaml';

const Base = z.object({
  templateVersion: z.string(),
  defaultVersion: z.string().or(z.number()),
  documentation: z.string(),
  description: z.string(),
  type: z.string(),
  name: z.string(),
  services: z.object({
    $$id: z.object({
      image: z.string(),
      ports: z.array(z.string()),
    })
  }),
}).partial();

const OtherServices = z.object({
  services: z.record(
    z.string(),
    z.object({
      image: z.string(),
      ports: z.array(z.string()).optional()
    })
  )
})

const templateDir = './services/templates'
const dir = await fs.readdir(templateDir)

for (const file of dir) {
  const template = yaml.load(await fs.readFile(`${templateDir}/${file}`, 'utf8'))
  const parseBase = Base.safeParse(template);
  if (!parseBase.success) {
    console.log(`Error at ${file}:`)
    console.log(parseBase.error.message)
    process.exit(1)
  }
  const parseOther = OtherServices.safeParse(template);
  if (!parseOther.success) {
    console.log(`Error at ${file}:`)
    console.log(parseOther.error.message)
    process.exit(1)
  }
}



