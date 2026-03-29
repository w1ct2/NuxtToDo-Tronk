export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5001/api',
    },
  },
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
