import mongoose from 'mongoose'
import { connectDB } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getDocumentFilter, requireAuthUser } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const user = requireAuthUser(event)
  await connectDB(config.mongoUri)

  const id = getRouterParam(event, 'id')

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid text id.',
    })
  }

  const text = await Chat.findOneAndDelete(getDocumentFilter(user, id, 'text'))

  if (!text) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Text not found.',
    })
  }

  return {
    success: true,
  }
})
