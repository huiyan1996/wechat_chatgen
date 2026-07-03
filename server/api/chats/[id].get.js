import mongoose from 'mongoose'
import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { buildCreatedBy, getDocumentFilter, requireAuthUser, serializeChat } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

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
