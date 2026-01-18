'use client';

import type { Comment } from '@/types';
import { formatDateTime, getInitials } from '@/lib/utils';

interface CommentListProps {
    comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return (
            <div className="empty-state">
                <p className="empty-state-description">No comments yet. Be the first to comment!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-md">
            {comments.map((comment) => (
                <div key={comment.id} className="comment">
                    <div className="avatar">
                        {comment.user?.fullName ? getInitials(comment.user.fullName) : '?'}
                    </div>
                    <div className="comment-content">
                        <div className="comment-header">
                            <span className="comment-author">
                                {comment.user?.fullName || comment.user?.email || 'Unknown'}
                            </span>
                            <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
                        </div>
                        <div className="comment-body">{comment.content}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
