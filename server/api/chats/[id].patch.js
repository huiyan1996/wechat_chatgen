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

  const body = await readBody(event)
  const chat = await Chat.findOne(getDocumentFilter(user, id, 'chat'))

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found.',
    })
  }

  if (body?.genTitle !== undefined) {
    chat.genTitle = String(body.genTitle).trim() || '捡手机文学'
  }

  if (body?.author !== undefined) {
    chat.author = String(body.author).trim() || '无名'
  }

  if (body?.chatName !== undefined) {
    chat.chatName = String(body.chatName)
  }

  if (body?.chatType !== undefined) {
    chat.chatType = body.chatType === 'private' ? 'private' : 'group'
  }

  if (body?.userList !== undefined) {
    chat.userList = body.userList
  }

  if (body?.chatList !== undefined) {
    chat.chatList = body.chatList
  }

  if (body?.nextChapter !== undefined) {
    chat.nextChapter = body.nextChapter && mongoose.Types.ObjectId.isValid(body.nextChapter)
      ? body.nextChapter
      : null
  }

  chat.createdBy = buildCreatedBy(user)

  await chat.save()

  return {
    chat: serializeChat(chat),
  }
})
