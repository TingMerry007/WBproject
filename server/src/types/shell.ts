export interface Comment {
  id: string
  nickname: string
  content: string
  createdAt: string
}

export interface Shell {
  id: string
  nickname: string
  content: string
  images: string[]
  likes: number
  liked: boolean
  favorites: number
  favorited: boolean
  comments: Comment[]
  createdAt: string
}
