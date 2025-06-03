'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Heart, MessageCircle } from 'lucide-react'
import CommentsSection from './CommentsSection'

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
    comments: number
  }
}

interface PostCardProps {
  post: Post
  onUpdate: () => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { data: session } = useSession() as { data: Session | null }
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const isLiked = post.likes.some(like => like.user.id === session?.user?.id)

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })
      onUpdate()
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleOpenComments = () => {
    setShowComments(true)
  }

  const handleCloseComments = () => {
    setShowComments(false)
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {post.user.avatar ? (
              <Image
                src={post.user.avatar}
                alt={post.user.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {post.user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{post.user.username}</p>
            {post.user.name && (
              <p className="text-xs text-gray-500">{post.user.name}</p>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-square">
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            fill
            className="object-cover"
          />
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-700'
              } hover:text-red-500 transition-colors`}
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`}
              />
            </button>
            <button 
              onClick={handleOpenComments}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Likes count */}
          <p className="text-sm font-medium mb-2">
            {post._count.likes} {post._count.likes === 1 ? 'like' : 'likes'}
          </p>

          {/* Comments count */}
          {post._count.comments > 0 && (
            <button 
              onClick={handleOpenComments}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 block"
            >
              Voir {post._count.comments === 1 ? 'le commentaire' : `les ${post._count.comments} commentaires`}
            </button>
          )}

          {/* Caption */}
          {post.caption && (
            <p className="text-sm">
              <span className="font-medium">{post.user.username}</span>{' '}
              {post.caption}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentsSection
        postId={post.id}
        isOpen={showComments}
        onClose={handleCloseComments}
      />
    </>
  )
} 