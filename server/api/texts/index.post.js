import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { buildCreatedBy, requireAuthUser, serializeChat, toObjectId } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const body = await readBody(event)
  const content = body?.content || ''

  const text = await Chat.create({
    userId: toObjectId(user.id),
    createdBy: buildCreatedBy(user),
    type: 'text',
    genTitle: body?.genTitle || '\u65b0\u6587\u672c',
    author: body?.author || user.name || '\u65e0\u540d',
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
