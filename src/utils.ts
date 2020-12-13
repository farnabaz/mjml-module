import path from 'path'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import template from 'lodash/template'
import consola from 'consola'
import mjml2html from 'mjml'

export const logger = consola.withScope('@nuxtjs/mjml')

export function parseTemplate (templateStr: string) {
  return template(templateStr, {
    interpolate: /{{([\s\S]+?)}}/g,
    evaluate: /{%([\s\S]+?)%}/g
  }, false)
}

export async function reCreateDirectory (_path: string) {
  if (await fs.pathExists(_path)) {
    fs.removeSync(_path)
  }
  await fs.mkdirp(_path)
}

export async function ensureDirectory (_path: string) {
  if (!await fs.pathExists(_path)) {
    await fs.mkdirp(_path)
  }
}

export function watchFiles (input, callback) {
  const filesWatcher = chokidar.watch(input, {
    ignoreInitial: true
  })

  if (filesWatcher) {
    logger.info(`Watching ${input} for new templates`)

    // Watch for new icons
    filesWatcher.on('add', file => callback(file, 'add'))

    // Keep eye on current icons
    filesWatcher.on('change', file => callback(file, 'change'))

    // Pray for lost icon
    filesWatcher.on('unlink', file => callback(file, 'unlink'))

    // Pray for lost directory
    filesWatcher.on('unlinkDir', file => callback(file, 'unlinkDir'))
  }
  return filesWatcher
}

export async function compileMjmlFile (options, file:string) {
  const htmlFile = file.replace(/mjml$/, 'html')
  const inputFile = path.join(options.input, file)
  const outputFile = path.join(options.output, htmlFile)

  const templateContent = await fs.readFile(inputFile, { encoding: 'utf8' })

  const html = compileMjml(templateContent)

  await fs.writeFile(outputFile, html, { encoding: 'utf8' })
  return htmlFile
}

export function compileMjml (mjml: string): string {
  const compiledContent = mjml2html(mjml)
  if (compiledContent.error) {
    logger.error(compiledContent.error)
  }
  return compiledContent.html
}
