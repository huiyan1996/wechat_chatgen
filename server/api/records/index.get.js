import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { getOwnerFilter, requireAuthUser, serializeChat } from '../../utils/chat'

const getSortOptions = (query) => {
  const sortBy = query.sortBy === 'genTitle' ? 'genTitle' : 'createdAt'
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1

  return {
    [sortBy]: sortOrder,
  }
}

const getSearchFilter = (query) => {
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  if (!search) {
    return {}
  }

  return {
    genTitle: {
      $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    },
  }
}

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const query = getQuery(event)
  const records = await Chat.find({
    ...getOwnerFilter(user),
    ...getSearchFilter(query),
  })
    .sort(getSortOptions(query))
    .select('userId createdBy genTitle author chatName type createdAt updatedAt')

  return {
    records: records.map((record) => serializeChat(record)),
    sortBy: query.sortBy === 'genTitle' ? 'genTitle' : 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
  }
})
