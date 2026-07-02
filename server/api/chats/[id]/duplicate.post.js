import mongoose from 'mongoose'
import { connectDB } from '../../../utils/db'
import { Chat } from '../../../models/Chat'
import { buildCreatedBy, getDocumentFilter, requireAuthUser, serializeChat, toObjectId } from '../../../utils/chat'

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

  const original = await Chat.findOne(getDocumentFilter(user, id, 'chat'))

  if (!original) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found.',
    })
  }

  const duplicate = await Chat.create({
    userId: toObjectId(user.id),
    createdBy: buildCreatedBy(user),
    type: 'chat',
    genTitle: original.genTitle ? `${original.genTitle} copy` : 'Untitled copy',
    author: original.author,
    chatName: original.chatName,
    chatType: original.chatType,
    userList: original.userList,
    chatList: [],
    nextChapter: null,
  })

  return {
    chat: serializeChat(duplicate),
  }
})
