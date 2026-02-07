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

export default function Comments({ slug, apiBase = import.meta.env.PUBLIC_COMMENTS_API || "http://localhost:3000" }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [newComment, setNewComment] = useState({ author: '', content: '' });
    const [message, setMessage] = useState('');

    const fetchComments = async (pageNum: number) => {
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
        <div className="comments-section" style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Comments</h3>

            <div className="comments-list" style={{ marginBottom: '30px' }}>
                {comments.map((comment) => (
                    <div key={comment.id} className="comment-card" style={{ background: 'white', padding: '15px', marginBottom: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                            <strong>{comment.author}</strong>
                            <small style={{ color: '#888' }}>{new Date(comment.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                    </div>
                ))}

                {loading && <p>Loading comments...</p>}

                {!loading && comments.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No comments yet. Be the first!</p>}

                {hasMore && !loading && comments.length > 0 && (
                    <button onClick={handleLoadMore} style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Load More
                    </button>
                )}
            </div>

            <div className="comment-form">
                <h4>Leave a Comment</h4>
                {message && <p style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px' }}>{message}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={newComment.author}
                        onChange={e => setNewComment({ ...newComment, author: e.target.value })}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <textarea
                        placeholder="Your Comment"
                        value={newComment.content}
                        onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                        required
                        rows={4}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" style={{ padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Post Comment
                    </button>
                </form>
            </div>
        </div>
    );
}
