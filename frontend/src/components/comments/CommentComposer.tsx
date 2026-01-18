'use client';

import { useState, KeyboardEvent } from 'react';
import { getInitials } from '@/lib/utils';

interface CommentComposerProps {
    onSubmit: (content: string) => Promise<void>;
    currentUserName?: string;
}

export default function CommentComposer({ onSubmit, currentUserName }: CommentComposerProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content.trim());
            setContent('');
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="comment-composer">
            <div className="avatar avatar-sm">{getInitials(currentUserName || '')}</div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (Cmd/Ctrl + Enter to send)"
                rows={3}
                disabled={isSubmitting}
            />
            <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                style={{ alignSelf: 'flex-start' }}
            >
                {isSubmitting ? '...' : '💬'}
            </button>
        </div>
    );
}
