import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = process.argv[2] || join(__dirname, 'seed-kenpaul-ch1.json')
const payload = JSON.parse(readFileSync(dataPath, 'utf8'))

const mongoUri = process.env.MONGODB_URI
  || 'mongodb+srv://kate6450_db_user:jm6v8znfVwxR2te9@chat1.xpe045r.mongodb.net/chatgen?appName=Chat1'

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: {
      name: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true, lowercase: true },
    },
    genTitle: { type: String, default: '捡手机文学', trim: true },
    author: { type: String, default: '无名', trim: true },
    chatName: { type: String, default: '', trim: true },
    chatType: { type: String, enum: ['group', 'private'], default: 'group' },
    type: { type: String, default: 'chat' },
    userList: {
      type: [{ name: { type: String, required: true }, img: { type: String, default: '' } }],
      default: [],
    },
    chatList: { type: [mongoose.Schema.Types.Mixed], default: [] },
    nextChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', default: null },
  },
  { timestamps: true },
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true },
)

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema)

const run = async () => {
  await mongoose.connect(mongoUri)

  const userId = new mongoose.Types.ObjectId(payload.userId)
  const user = await User.findById(userId).select('name email')

  if (!user) {
    throw new Error(`User not found: ${payload.userId}`)
  }

  const chat = await Chat.create({
    userId,
    createdBy: {
      name: user.name || '',
      email: user.email || '',
    },
    genTitle: payload.genTitle,
    author: payload.author,
    chatName: payload.chatName,
    chatType: payload.chatType || 'group',
    type: payload.type || 'chat',
    userList: payload.userList || [],
    chatList: payload.chatList || [],
    nextChapter: payload.nextChapter || null,
  })

  console.log('Inserted chat successfully:')
  console.log(`  id: ${chat._id.toString()}`)
  console.log(`  title: ${chat.genTitle}`)
  console.log(`  messages: ${chat.chatList.length}`)
  console.log(`  edit: /chat/${chat._id.toString()}`)
  console.log(`  view: /view/chat/${chat._id.toString()}`)

  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(error.message || error)
  await mongoose.disconnect()
  process.exit(1)
})
