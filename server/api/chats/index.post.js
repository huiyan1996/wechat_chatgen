import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { buildCreatedBy, requireAuthUser, serializeChat, toObjectId } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const body = await readBody(event)
  const userId = toObjectId(user.id)

  const chat = await Chat.create({
    userId,
    createdBy: buildCreatedBy(user),
    type: 'chat',
    genTitle: body?.genTitle || '\u6361\u624b\u673a\u6587\u5b66',
    author: body?.author || user.name || '\u65e0\u540d',
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
