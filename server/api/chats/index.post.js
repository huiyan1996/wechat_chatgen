import { connectDB } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { buildCreatedBy, requireAuthUser, serializeChat, toObjectId } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const user = requireAuthUser(event)
  await connectDB(config.mongoUri)

  const body = await readBody(event)
  const userId = toObjectId(user.id)

  const chat = await Chat.create({
    userId,
    createdBy: buildCreatedBy(user),
    type: 'chat',
    genTitle: body?.genTitle || '捡手机文学',
    author: body?.author || user.name || '无名',
    chatName: body?.chatName || '',
    chatType: body?.chatType || 'group',
    userList: body?.userList || [],
    chatList: body?.chatList || [],
    nextChapter: body?.nextChapter || null,
  })

  return {
    chat: serializeChat(chat),
  }
})
