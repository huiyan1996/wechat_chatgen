export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    config.jwtSecret = process.env.NUXT_JWT_SECRET || process.env.JWT_SECRET || ''
  }

  if (!config.mongoUri) {
    config.mongoUri = process.env.NUXT_MONGO_URI || process.env.MONGODB_URI || ''
  }
})
