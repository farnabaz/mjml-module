import path from 'path'
import fs from 'fs-extra'
import { compileMjmlFile, ensureDirectory, reCreateDirectory, watchFiles } from './utils'

export default async function mjmlModule () {
  const { nuxt } = this
  const options = {
    input: '~/mails',
    output: './node_modules/.cache/.nuxt_mails'
  }

  options.input = this.nuxt.resolver.resolveAlias(options.input)
  options.output = path.resolve(options.output)

  await ensureDirectory(options.input)
  await reCreateDirectory(options.output)

  const templates = await fs.readdir(options.input)
  templates.forEach(file => compileMjmlFile(options, file))

  const filesWatcher = watchFiles(options.input, handleFilesChanged(options))
  this.nuxt.hook('close', () => {
    filesWatcher.close()
  })

  if (nuxt.options.dev) {
    const layout = path.resolve(__dirname, '../runtime', 'layouts', 'mjml.vue')
    this.addLayout(layout, 'mjml')

    const componentPath = path.resolve(__dirname, '../runtime', 'pages', 'demo.vue')
    this.extendRoutes((routes) => {
      routes.unshift({
        name: 'mails-list',
        path: '/_mails/:slug?',
        component: componentPath
      })
    })
  }

  this.addServerMiddleware({
    path: '/_mails',
    handler: path.resolve(__dirname, './middleware')
  })

  nuxt.hook('webpack:config', (configs) => {
    configs.forEach((config) => {
      config.module.rules.push({
        test: /\.mjml$/,
        use: [
          {
            loader: 'webpack-mjml-loader',
            options: { /* any mjml options */ minify: true } // optional, you can omit options
          }
        ]
      })
    })
  })

  // Transpile and alias
  const runtimeDir = path.resolve(__dirname, 'helpers')
  nuxt.options.alias['~mjml'] = runtimeDir

  nuxt.options.build.transpile.push(runtimeDir)
}

function handleFilesChanged (options) {
  return async (file: string, changeType: string) => {
    file = file.split('/').pop()
    switch (changeType) {
      case 'add':
      case 'change':
        compileMjmlFile(options, file)
        break
      case 'unlink':
        await fs.remove(path.join(options.output, file.replace(/.mjml$/, '.html')))
        break
    }
  }
}
