import mongoose from 'mongoose'
import { connectDBFromEvent } from '../../../utils/db'
import { Chat } from '../../../models/Chat'

const serializePublicRecord = (record, nextChapter) => {
  return {
    id: record._id.toString(),
    genTitle: record.genTitle,
    author: record.author,
    chatName: record.chatName,
    chatType: record.chatType,
    type: record.type || 'chat',
    chatList: record.chatList || [],
    nextChapter,
  }
}

export default defineEventHandler(async (event) => {
  await connectDBFromEvent(event)

  const id = getRouterParam(event, 'id')

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid record id.',
    })
  }

  const record = await Chat.findById(id)

  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found.',
    })
  }

  let nextChapter = null

  if (record.nextChapter) {
    const next = await Chat.findById(record.nextChapter).select('type genTitle')

    if (next) {
      nextChapter = {
        id: next._id.toString(),
        type: next.type || 'chat',
        title: next.genTitle || '无标题',
      }
    }
  }

  return {
    record: serializePublicRecord(record, nextChapter),
  }
})
