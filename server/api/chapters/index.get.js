import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getOwnerFilter, requireAuthUser } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const chapters = await Chat.find(getOwnerFilter(user))
    .sort({ genTitle: 1 })
    .select('genTitle type')

  return {
    chapters: chapters.map((chapter) => ({
      id: chapter._id.toString(),
      title: chapter.genTitle || '\u65e0\u6807\u9898',
      type: chapter.type || 'chat',
    })),
  }
})
