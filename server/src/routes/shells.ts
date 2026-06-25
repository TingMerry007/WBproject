import { Hono } from 'hono'
import type { Shell } from '../types/shell.js'
import * as store from '../store/shellStore.js'

const shellsRoute = new Hono()

function validateShellInput(body: unknown): Omit<Shell, 'id' | 'likes' | 'liked' | 'favorites' | 'favorited' | 'comments' | 'createdAt'> | null {
  if (typeof body !== 'object' || body === null) return null

  const input = body as Record<string, unknown>
  const nickname = typeof input.nickname === 'string' ? input.nickname.trim() : ''
  const content = typeof input.content === 'string' ? input.content.trim() : ''
  const images = Array.isArray(input.images)
    ? input.images.filter((img): img is string => typeof img === 'string')
    : []

  if (!nickname) return null
  if (!content || content.length > 1000) return null
  if (images.length > 9) return null

  return { nickname, content, images }
}

function validateCommentInput(body: unknown): { nickname: string; content: string } | null {
  if (typeof body !== 'object' || body === null) return null

  const input = body as Record<string, unknown>
  const nickname = typeof input.nickname === 'string' ? input.nickname.trim() : ''
  const content = typeof input.content === 'string' ? input.content.trim() : ''

  if (!nickname) return null
  if (!content || content.length > 500) return null

  return { nickname, content }
}

shellsRoute.get('/', (c) => {
  return c.json(store.getAllShells())
})

shellsRoute.get('/:id', (c) => {
  const shell = store.getShellById(c.req.param('id'))
  if (!shell) return c.json({ error: 'Shell not found' }, 404)
  return c.json(shell)
})

shellsRoute.post('/', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const input = validateShellInput(body)
  if (!input) {
    return c.json({ error: 'Invalid shell data' }, 400)
  }

  const shell = store.createShell(input)
  return c.json(shell, 201)
})

shellsRoute.delete('/:id', (c) => {
  const deleted = store.deleteShell(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Shell not found' }, 404)
  return c.body(null, 204)
})

shellsRoute.post('/:id/like', (c) => {
  const shell = store.toggleLike(c.req.param('id'))
  if (!shell) return c.json({ error: 'Shell not found' }, 404)
  return c.json(shell)
})

shellsRoute.post('/:id/favorite', (c) => {
  const shell = store.toggleFavorite(c.req.param('id'))
  if (!shell) return c.json({ error: 'Shell not found' }, 404)
  return c.json(shell)
})

shellsRoute.get('/:id/comments', (c) => {
  const comments = store.getComments(c.req.param('id'))
  if (!comments) return c.json({ error: 'Shell not found' }, 404)
  return c.json(comments)
})

shellsRoute.post('/:id/comments', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const input = validateCommentInput(body)
  if (!input) {
    return c.json({ error: 'Invalid comment data' }, 400)
  }

  const result = store.addComment(c.req.param('id'), input)
  if (!result) return c.json({ error: 'Shell not found' }, 404)

  return c.json(result, 201)
})

export default shellsRoute
