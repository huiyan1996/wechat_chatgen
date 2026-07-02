import { mkdir, writeFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { requireAuthUser } from '../utils/chat'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

const mimeToExtension = (mimeType) => {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  }

  return map[mimeType] || '.img'
}

export default defineEventHandler(async (event) => {
  requireAuthUser(event)

  const formData = await readMultipartFormData(event)
  const filePart = formData?.find((part) => part.name === 'file')

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded.',
    })
  }

  const mimeType = filePart.type || 'application/octet-stream'

  if (!ALLOWED_TYPES.has(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image type. Use JPG, PNG, GIF, or WebP.',
    })
  }

  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File too large. Maximum size is 5MB.',
    })
  }

  const extension = extname(filePart.filename || '') || mimeToExtension(mimeType)
  const filename = `${randomUUID()}${extension}`
  const uploadDir = `${process.cwd()}/public/uploads`

  await mkdir(uploadDir, { recursive: true })
  await writeFile(`${uploadDir}/${filename}`, filePart.data)

  return {
    url: `/uploads/${filename}`,
  }
})
