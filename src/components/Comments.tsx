import React, { useState, useEffect } from 'react';

interface Comment {
    id: string;
    slug: string;
    author: string;
    content: string;
    createdAt: string;
}

interface CommentsProps {
    slug: string;
    apiBase?: string;
}

export default function Comments({ slug, apiBase = import.meta.env.PUBLIC_COMMENTS_API }: CommentsProps) {
    if (!apiBase) {
        console.error("PUBLIC_COMMENTS_API is not defined. Please set it in your environment/build configuration.");
    }
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [newComment, setNewComment] = useState({ author: '', content: '' });
    const [message, setMessage] = useState('');

    const fetchComments = async (pageNum: number) => {
        if (!apiBase) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/comments?slug=${slug}&page=${pageNum}&limit=10`);
            if (!res.ok) throw new Error('Failed to fetch comments');
            const data = await res.json();

            if (data.length < 10) {
                setHasMore(false);
            }

            if (pageNum === 1) {
                setComments(data);
            } else {
                setComments(prev => [...prev, ...data]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(1);
    }, [slug]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.author || !newComment.content) return;

        try {
            const res = await fetch(`${apiBase}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newComment, slug })
            });

            if (res.ok) {
                setMessage('Comment submitted for checking! It will appear after approval.');
                setNewComment({ author: '', content: '' });
            } else {
                setMessage('Failed to submit comment.');
            }
        } catch (err) {
            setMessage('Error submitting comment.');
        }
    };

    return (
        <div className="comments-section" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--gray-800)' }}>
            <h3 style={{ color: 'var(--gray-0)', marginBottom: '1rem' }}>Comments</h3>

            <div className="comments-list" style={{ marginBottom: '30px' }}>
                {comments.map((comment) => (
                    <div key={comment.id} className="comment-card" style={{
                        background: 'var(--gray-999)',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--gray-800)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid var(--gray-800)', paddingBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--gray-0)' }}>{comment.author}</strong>
                            <small style={{ color: 'var(--gray-300)' }}>{new Date(comment.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-300)' }}>{comment.content}</div>
                    </div>
                ))}

                {loading && <p style={{ color: 'var(--gray-300)' }}>Loading comments...</p>}

                {!loading && comments.length === 0 && <p style={{ color: 'var(--gray-300)', fontStyle: 'italic' }}>No comments yet. Be the first!</p>}

                {hasMore && !loading && comments.length > 0 && (
                    <button onClick={handleLoadMore} style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--gray-800)',
                        color: 'var(--gray-0)',
                        border: '1px solid var(--gray-800)', // border to match input style
                        borderRadius: '999rem', // rounded pill style like site
                        cursor: 'pointer',
                        transition: 'background-color var(--theme-transition)'
                    }}>
                        Load More
                    </button>
                )}
            </div>

            <div className="comment-form">
                <h4 style={{ color: 'var(--gray-0)', marginBottom: '1rem' }}>Leave a Comment</h4>
                {message && <p style={{ padding: '10px', background: 'var(--accent-subtle-overlay)', color: 'var(--accent-text-over)', borderRadius: '0.5rem' }}>{message}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={newComment.author}
                        onChange={e => setNewComment({ ...newComment, author: e.target.value })}
                        required
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--gray-800)',
                            background: 'var(--gray-999)',
                            color: 'var(--gray-0)',
                            fontFamily: 'inherit'
                        }}
                    />
                    <textarea
                        placeholder="Your Comment"
                        value={newComment.content}
                        onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                        required
                        rows={4}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--gray-800)',
                            background: 'var(--gray-999)',
                            color: 'var(--gray-0)',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <button type="submit" style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--accent-regular)',
                        color: 'var(--accent-text-over)',
                        border: 'none',
                        borderRadius: '999rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: 'fit-content'
                    }}>
                        Post Comment
                    </button>
                </form>
            </div>
        </div>
    );
}
