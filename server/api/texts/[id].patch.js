import mongoose from 'mongoose'
import { connectDBFromEvent } from '../../utils/db'
import { Chat } from '../../models/Chat'
import { applyCreatedByIfOwner, getDocumentFilter, requireAuthUser, serializeChat } from '../../utils/chat'

export default defineEventHandler(async (event) => {
  const user = requireAuthUser(event)
  await connectDBFromEvent(event)

  const id = getRouterParam(event, 'id')

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid text id.',
    })
  }

  const body = await readBody(event)
  const text = await Chat.findOne(getDocumentFilter(user, id, 'text'))

  if (!text) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Text not found.',
    })
  }

  if (body?.genTitle !== undefined) {
    text.genTitle = String(body.genTitle).trim() || '新文本'
  }

  if (body?.author !== undefined) {
    text.author = String(body.author).trim() || '无名'
  }

  if (body?.content !== undefined || body?.fontSize !== undefined) {
    const existingBlock = text.chatList?.[0] || {}
    text.chatList = [{
      type: 'text',
      content: body?.content !== undefined ? body.content : existingBlock.content || '',
      fontSize: body?.fontSize !== undefined
        ? Number(body.fontSize) || 18
        : existingBlock.fontSize ?? 18,
    }]
  }

  if (body?.nextChapter !== undefined) {
    text.nextChapter = body.nextChapter && mongoose.Types.ObjectId.isValid(body.nextChapter)
      ? body.nextChapter
      : null
  }

  applyCreatedByIfOwner(user, text)

  await text.save()

  return {
    text: serializeChat(text),
  }
})
