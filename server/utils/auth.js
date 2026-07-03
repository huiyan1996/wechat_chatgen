import jwt from 'jsonwebtoken'

const AUTH_COOKIE = 'chatgen_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7
const MASTER_ACCOUNT_EMAIL = 'chunling1996@hotmail.com'

export const isMasterEmail = (email) => {
  return String(email || '').trim().toLowerCase() === MASTER_ACCOUNT_EMAIL
}

export const isMasterUser = (user) => {
  return Boolean(user?.isMaster) || isMasterEmail(user?.email)
}

export const getAuthCookieName = () => AUTH_COOKIE

export const signAuthToken = (payload, secret) => {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export const verifyAuthToken = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

export const setAuthCookie = (event, token) => {
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  })
}

export const clearAuthCookie = (event) => {
  deleteCookie(event, AUTH_COOKIE, {
    path: '/',
  })
}

export const getAuthTokenFromEvent = (event) => {
  return getCookie(event, AUTH_COOKIE) || null
}

import { getJwtSecret } from './runtime-secrets'

export const getAuthUserFromEvent = (event) => {
  const token = getAuthTokenFromEvent(event)

  if (!token) {
    return null
  }

  const payload = verifyAuthToken(token, getJwtSecret(event))

  if (!payload?.userId) {
    return null
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    isMaster: Boolean(payload.isMaster) || isMasterEmail(payload.email),
  }
}

export const sanitizeUser = (user) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    isMaster: isMasterEmail(user.email),
  }
}
