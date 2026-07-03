import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getChatListFilter, requireAuthUser, serializeChat } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const chats = await Chat.find(getChatListFilter(user))
    .sort({ genTitle: 1 })
    .select('userId createdBy genTitle author chatName type createdAt updatedAt')

  return {
    chats: chats.map((chat) => serializeChat(chat)),
  }
})
