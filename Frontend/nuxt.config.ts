export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  alias: {
    '@': '/<rootDir>',
    '@cmpn': '/components',
    '@asts': '/assets',
  },
  css: [
    './assets/scss/index.scss'
  ],
  app: {
    head: {
      title: 'NuxtToDo',
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
})
