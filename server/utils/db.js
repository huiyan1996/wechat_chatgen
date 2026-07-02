import mongoose from 'mongoose'

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
