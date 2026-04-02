export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5001/api', // Базовый url для api
    },
  },
  alias: {
    '@': '/<rootDir>',
    '@cmpn': '/components',
    '@asts': '/assets',
  },
  css: [
    './assets/scss/index.scss' // Глобальный css
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
