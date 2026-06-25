import type { Shell } from '@/types/shell'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function handleResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      if (body.error) message = body.error
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return null
  return response.json()
}

export async function fetchShells(): Promise<Shell[]> {
  const response = await fetch(`${API_BASE}/shells`)
  return handleResponse(response) as Promise<Shell[]>
}

export async function fetchShell(id: string): Promise<Shell> {
  const response = await fetch(`${API_BASE}/shells/${id}`)
  return handleResponse(response) as Promise<Shell>
}

export async function createShell(payload: { nickname: string; content: string; images: string[] }): Promise<Shell> {
  const response = await fetch(`${API_BASE}/shells`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return handleResponse(response) as Promise<Shell>
}

export async function deleteShell(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/shells/${id}`, {
    method: 'DELETE'
  })
  await handleResponse(response)
}

export async function toggleShellLike(id: string): Promise<Shell> {
  const response = await fetch(`${API_BASE}/shells/${id}/like`, {
    method: 'POST'
  })
  return handleResponse(response) as Promise<Shell>
}
