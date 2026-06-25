import type { Shell } from '../types/shell.js'

const shells = new Map<string, Shell>()

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function getAllShells(): Shell[] {
  return Array.from(shells.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getShellById(id: string): Shell | undefined {
  return shells.get(id)
}

export function createShell(input: Omit<Shell, 'id' | 'likes' | 'liked' | 'favorites' | 'favorited' | 'createdAt'>): Shell {
  const shell: Shell = {
    ...input,
    id: generateId(),
    likes: 0,
    liked: false,
    favorites: 0,
    favorited: false,
    createdAt: new Date().toISOString()
  }
  shells.set(shell.id, shell)
  return shell
}

export function deleteShell(id: string): boolean {
  return shells.delete(id)
}

export function toggleLike(id: string): Shell | undefined {
  const shell = shells.get(id)
  if (!shell) return undefined

  shell.liked = !shell.liked
  shell.likes += shell.liked ? 1 : -1
  return shell
}

export function toggleFavorite(id: string): Shell | undefined {
  const shell = shells.get(id)
  if (!shell) return undefined

  shell.favorited = !shell.favorited
  shell.favorites += shell.favorited ? 1 : -1
  return shell
}

export function resetStore(): void {
  shells.clear()
}
