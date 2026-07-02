import { connectDB } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { buildCreatedBy, requireAuthUser, serializeChat, toObjectId } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const user = requireAuthUser(event)
  await connectDB(config.mongoUri)

  const body = await readBody(event)
  const content = body?.content || ''

  const text = await Chat.create({
    userId: toObjectId(user.id),
    createdBy: buildCreatedBy(user),
    type: 'text',
    genTitle: body?.genTitle || '新文本',
    author: body?.author || user.name || '无名',
    chatList: [{
      type: 'text',
      content,
    }],
    nextChapter: body?.nextChapter || null,
  })

  return {
    text: serializeChat(text),
  }
})
