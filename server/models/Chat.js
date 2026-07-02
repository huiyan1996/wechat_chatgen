import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdBy: {
      name: {
        type: String,
        default: '',
        trim: true,
      },
      email: {
        type: String,
        default: '',
        trim: true,
        lowercase: true,
      },
    },
    genTitle: {
      type: String,
      default: '捡手机文学',
      trim: true,
    },
    author: {
      type: String,
      default: '无名',
      trim: true,
    },
    chatName: {
      type: String,
      default: '',
      trim: true,
    },
    chatType: {
      type: String,
      enum: ['group', 'private'],
      default: 'group',
    },
    type: {
      type: String,
      default: 'chat',
    },
    userList: {
      type: [
        {
          name: { type: String, required: true },
          img: { type: String, default: '' },
        },
      ],
      default: [],
    },
    chatList: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    nextChapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema)
