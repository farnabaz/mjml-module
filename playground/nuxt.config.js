import path from 'path'

export default {
  components: true,
  srcDir: path.resolve(__dirname),
  rootDir: path.resolve(__dirname, '..'),
  buildModules: [
    '@nuxt/typescript-build',
    '../src'
  ],
}
