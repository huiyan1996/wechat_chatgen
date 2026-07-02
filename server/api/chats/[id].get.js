import mongoose from 'mongoose'
import { connectDB } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { buildCreatedBy, getDocumentFilter, requireAuthUser, serializeChat } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const user = requireAuthUser(event)
  await connectDB(config.mongoUri)

  const id = getRouterParam(event, 'id')

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid chat id.',
    })
  }

  const chat = await Chat.findOne(getDocumentFilter(user, id, 'chat'))

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found.',
    })
  }

  return {
    chat: serializeChat(chat),
  }
})
