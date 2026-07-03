import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getTextListFilter, requireAuthUser, serializeChat } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const texts = await Chat.find(getTextListFilter(user))
    .sort({ genTitle: 1 })
    .select('userId createdBy genTitle author type createdAt updatedAt')

  return {
    texts: texts.map((text) => serializeChat(text)),
  }
})
