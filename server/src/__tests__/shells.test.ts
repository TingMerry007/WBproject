import { describe, it, expect, beforeEach } from 'vitest'
import app from '../index'
import { resetStore } from '../store/shellStore'

interface Shell {
  id: string
  nickname: string
  content: string
  images: string[]
  likes: number
  liked: boolean
  favorites: number
  favorited: boolean
  comments: { id: string; nickname: string; content: string; createdAt: string }[]
  createdAt: string
}

describe('API', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('GET /api/health', () => {
    it('returns ok status', async () => {
      const res = await app.request('/api/health')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ status: 'ok' })
    })
  })

  describe('GET /api/shells', () => {
    it('returns empty list initially', async () => {
      const res = await app.request('/api/shells')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual([])
    })

    it('returns shells sorted by createdAt descending', async () => {
      await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'A', content: 'first', images: [] })
      })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'B', content: 'second', images: [] })
      })

      const res = await app.request('/api/shells')
      expect(res.status).toBe(200)
      const body: Shell[] = await res.json()
      expect(body).toHaveLength(2)
      expect(body[0].nickname).toBe('B')
      expect(body[1].nickname).toBe('A')
      expect(new Date(body[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(body[1].createdAt).getTime()
      )
    })
  })

  describe('POST /api/shells', () => {
    it('creates a shell with generated id and createdAt', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello world', images: [] })
      })
      expect(res.status).toBe(201)
      const body: Shell = await res.json()
      expect(body.id).toBeDefined()
      expect(body.id.length).toBeGreaterThan(0)
      expect(body.nickname).toBe('Nick')
      expect(body.content).toBe('Hello world')
      expect(body.images).toEqual([])
      expect(body.likes).toBe(0)
      expect(body.liked).toBe(false)
      expect(body.favorites).toBe(0)
      expect(body.favorited).toBe(false)
      expect(body.comments).toEqual([])
      expect(body.createdAt).toBeDefined()
      expect(new Date(body.createdAt).toISOString()).toBe(body.createdAt)
    })

    it('rejects missing nickname', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Hello', images: [] })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it('rejects empty nickname after trim', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: '   ', content: 'Hello', images: [] })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it('rejects missing content', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', images: [] })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it('rejects empty content after trim', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: '\t\n ', images: [] })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it('rejects content exceeding 1000 characters', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'x'.repeat(1001), images: [] })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it('accepts content of exactly 1000 characters', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'x'.repeat(1000), images: [] })
      })
      expect(res.status).toBe(201)
    })

    it('rejects more than 9 images', async () => {
      const res = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: 'Nick',
          content: 'Hello',
          images: Array(10).fill('data:image/jpeg;base64,/9j/4AAQ')
        })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })

  describe('GET /api/shells/:id', () => {
    it('returns the shell by id', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      const res = await app.request(`/api/shells/${created.id}`)
      expect(res.status).toBe(200)
      const body: Shell = await res.json()
      expect(body.id).toBe(created.id)
      expect(body.content).toBe('Hello')
    })

    it('returns 404 for non-existent shell', async () => {
      const res = await app.request('/api/shells/non-existent-id')
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })

  describe('DELETE /api/shells/:id', () => {
    it('deletes the shell', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      const deleteRes = await app.request(`/api/shells/${created.id}`, { method: 'DELETE' })
      expect(deleteRes.status).toBe(204)

      const getRes = await app.request(`/api/shells/${created.id}`)
      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting non-existent shell', async () => {
      const res = await app.request('/api/shells/non-existent-id', { method: 'DELETE' })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })

  describe('POST /api/shells/:id/like', () => {
    it('toggles liked from false to true and increments likes', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      const likeRes = await app.request(`/api/shells/${created.id}/like`, { method: 'POST' })
      expect(likeRes.status).toBe(200)
      const liked: Shell = await likeRes.json()
      expect(liked.liked).toBe(true)
      expect(liked.likes).toBe(1)
    })

    it('toggles liked from true to false and decrements likes', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      await app.request(`/api/shells/${created.id}/like`, { method: 'POST' })
      const unlikeRes = await app.request(`/api/shells/${created.id}/like`, { method: 'POST' })
      expect(unlikeRes.status).toBe(200)
      const unliked: Shell = await unlikeRes.json()
      expect(unliked.liked).toBe(false)
      expect(unliked.likes).toBe(0)
    })

    it('returns 404 for non-existent shell', async () => {
      const res = await app.request('/api/shells/non-existent-id/like', { method: 'POST' })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })

  describe('POST /api/shells/:id/comments', () => {
    it('adds a comment to a shell', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      const commentRes = await app.request(`/api/shells/${created.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Commenter', content: 'Nice shell!' })
      })
      expect(commentRes.status).toBe(201)
      const result = await commentRes.json()
      expect(result.comment.nickname).toBe('Commenter')
      expect(result.comment.content).toBe('Nice shell!')
      expect(result.shell.comments).toHaveLength(1)
    })

    it('returns 404 for non-existent shell', async () => {
      const res = await app.request('/api/shells/non-existent-id/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Commenter', content: 'Nice shell!' })
      })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it('rejects invalid comment data', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      const res = await app.request(`/api/shells/${created.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Missing nickname' })
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })

  describe('POST /api/shells/:id/favorite', () => {
    it('toggles favorited from false to true and increments favorites', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      const favoriteRes = await app.request(`/api/shells/${created.id}/favorite`, { method: 'POST' })
      expect(favoriteRes.status).toBe(200)
      const favorited: Shell = await favoriteRes.json()
      expect(favorited.favorited).toBe(true)
      expect(favorited.favorites).toBe(1)
    })

    it('toggles favorited from true to false and decrements favorites', async () => {
      const createRes = await app.request('/api/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Nick', content: 'Hello', images: [] })
      })
      const created: Shell = await createRes.json()

      await app.request(`/api/shells/${created.id}/favorite`, { method: 'POST' })
      const unfavoriteRes = await app.request(`/api/shells/${created.id}/favorite`, { method: 'POST' })
      expect(unfavoriteRes.status).toBe(200)
      const unfavorited: Shell = await unfavoriteRes.json()
      expect(unfavorited.favorited).toBe(false)
      expect(unfavorited.favorites).toBe(0)
    })

    it('returns 404 for non-existent shell', async () => {
      const res = await app.request('/api/shells/non-existent-id/favorite', { method: 'POST' })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })
})
