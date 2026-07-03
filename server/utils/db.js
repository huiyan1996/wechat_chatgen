import mongoose from 'mongoose'
import { getMongoUri } from './runtime-secrets'

let isConnected = false

export const connectDB = async (mongoUri) => {
  if (isConnected) {
    return mongoose.connection
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(mongoUri)
  isConnected = true

  return mongoose.connection
}

export const connectDBFromEvent = async (event) => {
  return connectDB(getMongoUri(event))
}
