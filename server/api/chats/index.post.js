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
    genTitle: body?.genTitle || '?????',
    author: body?.author || user.name || '??',
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
