import mongoose from 'mongoose'
import { getAuthUserFromEvent } from './auth'

export const requireAuthUser = (event) => {
  const user = getAuthUserFromEvent(event)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return user
}

export const toObjectId = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return null
  }

  return new mongoose.Types.ObjectId(id)
}

export const buildCreatedBy = (user) => {
  return {
    name: user.name || '',
    email: user.email || '',
  }
}

export const getOwnerFilter = (user) => {
  const userId = toObjectId(user.id)

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return { userId }
}

export const getChatListFilter = (user) => ({
  ...getOwnerFilter(user),
  type: { $ne: 'text' },
})

export const getTextListFilter = (user) => ({
  ...getOwnerFilter(user),
  type: 'text',
})

export const getDocumentFilter = (user, id, docType = 'chat') => {
  const filter = {
    _id: id,
    ...getOwnerFilter(user),
  }

  if (docType === 'text') {
    filter.type = 'text'
  } else {
    filter.type = { $ne: 'text' }
  }

  return filter
}

export const serializeChat = (chat) => {
  return {
    id: chat._id.toString(),
    userId: chat.userId?.toString() || null,
    createdBy: chat.createdBy || null,
    genTitle: chat.genTitle,
    author: chat.author,
    chatName: chat.chatName,
    chatType: chat.chatType,
    type: chat.type,
    userList: chat.userList,
    chatList: chat.chatList,
    nextChapter: chat.nextChapter ? chat.nextChapter.toString() : null,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  }
}
