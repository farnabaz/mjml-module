import path from 'path'
import fs from 'fs-extra'
import { parseTemplate } from '../utils'

export async function getTemplatesList () {
  const cacheDir = path.resolve('./node_modules/.cache/.nuxt_mails')
  const files = await fs.readdir(cacheDir)
  const templates = files
    .map(file => file.split('/').pop())
    .filter(file => file.match(/\.html$/))
    .map(file => file.replace(/\.html$/, ''))

  return templates
}

export async function loadTemplate (name: string, options: any = {}) {
  let templatePath = name
  if (!templatePath.startsWith('/')) {
    templatePath = path.resolve('./node_modules/.cache/.nuxt_mails', name + '.html')
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error('Template not found')
  }

  const content = await fs.readFile(templatePath, { encoding: 'utf8' })

  const variables = options.variables || {}

  const compiledTemplate = parseTemplate(content)

  return compiledTemplate(variables)
}
