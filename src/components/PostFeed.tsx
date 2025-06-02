'use client'

import React from 'react'
import useSWR from 'swr'
import PostCard from './PostCard'

interface Post {
  id: string
  imageUrl: string
  caption?: string
  createdAt: string
  user: {
    id: string
    username: string
    name?: string
    avatar?: string
  }
  likes: Array<{
    id: string
    user: {
      id: string
      username: string
    }
  }>
  _count: {
    likes: number
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PostFeed() {
  const { data: posts, error, mutate } = useSWR('/api/posts', fetcher)

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading posts</p>
      </div>
    )
  }

  if (!posts) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No posts yet. Create the first one!</p>
        </div>
      ) : (
        posts.map((post: Post) => (
          <PostCard key={post.id} post={post} onUpdate={mutate} />
        ))
      )}
    </div>
  )
} 