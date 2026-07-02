import { connectDB } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getOwnerFilter, requireAuthUser } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const user = requireAuthUser(event)
  await connectDB(config.mongoUri)

  const chapters = await Chat.find(getOwnerFilter(user))
    .sort({ genTitle: 1 })
    .select('genTitle type')

  return {
    chapters: chapters.map((chapter) => ({
      id: chapter._id.toString(),
      title: chapter.genTitle || '无标题',
      type: chapter.type || 'chat',
    })),
  }
})
