import {cp, rm} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDirectory = join(projectRoot, 'public')
const buildDirectory = join(projectRoot, 'build')

await rm(buildDirectory, {recursive: true, force: true})
await cp(publicDirectory, buildDirectory, {recursive: true})

console.log('copied public/ to build/')
