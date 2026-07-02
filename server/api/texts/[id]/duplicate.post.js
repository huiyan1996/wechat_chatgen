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
      statusMessage: 'Invalid text id.',
    })
  }

  const original = await Chat.findOne(getDocumentFilter(user, id, 'text'))

  if (!original) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Text not found.',
    })
  }

  const duplicate = await Chat.create({
    userId: toObjectId(user.id),
    createdBy: buildCreatedBy(user),
    type: 'text',
    genTitle: original.genTitle ? `${original.genTitle} copy` : 'Untitled copy',
    author: original.author,
    chatList: original.chatList,
    nextChapter: null,
  })

  return {
    text: serializeChat(duplicate),
  }
})
