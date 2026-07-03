export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  routeRules: {
    '/chat': { redirect: '/listing' },
    '/text': { redirect: '/listing' },
    '/api/**': { cache: false, swr: false },
  },
  nitro: {
    preset: process.env.NETLIFY ? 'netlify' : undefined,
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    },
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET || process.env.JWT_SECRET || '',
    mongoUri: process.env.NUXT_MONGO_URI || process.env.MONGODB_URI || '',
    $development: {
      jwtSecret: 'chatgen-dev-secret-change-in-production',
      mongoUri: 'mongodb://127.0.0.1:27017/chatgen',
    },
    public: {
      appName: 'ChatGen',
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dm8co83yz',
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'wecgen',
    },
  },
  app: {
    head: {
      title: 'ChatGen',
      meta: [
        { name: 'description', content: 'ChatGen - AI chat generation platform' },
      ],
    },
  },
})
