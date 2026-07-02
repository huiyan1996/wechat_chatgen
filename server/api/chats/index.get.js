import { connectDB } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getChatListFilter, requireAuthUser, serializeChat } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const user = requireAuthUser(event)
  await connectDB(config.mongoUri)

  const chats = await Chat.find(getChatListFilter(user))
    .sort({ genTitle: 1 })
    .select('userId createdBy genTitle author chatName type createdAt updatedAt')

  return {
    chats: chats.map((chat) => serializeChat(chat)),
  }
})
