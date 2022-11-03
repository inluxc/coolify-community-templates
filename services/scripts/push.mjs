import * as dotenv from 'dotenv'
dotenv.config()

import fs from 'fs/promises'
import { Octokit } from "octokit";

if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN is required in .env file.");
}
const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

const outputDir = './output/'
const files = ['service-templates.yaml', 'service-tags.json']

for (const file of files) {
    const repo = {
        owner: 'coollabsio',
        repo: 'get.coollabs.io',
        path: `static/coolify/${file}`,
        message: `Updating ${file}.`
    }
    console.log(`Uploading ${file} to https://github.com/${repo.owner}/${repo.repo}/blob/main/${repo.path}'`)
    const data = await fs.readFile(outputDir + file, 'utf8')
    let sha = undefined
    try {
        const content = await octokit.rest.repos.getContent({ ...repo })
        sha = content.data.sha
    } catch (error) { }
    await octokit.rest.repos.createOrUpdateFileContents({ ...repo, content: Buffer.from(data).toString('base64'), sha, branch: "main" })
}

