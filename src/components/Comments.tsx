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
    lang?: string;
    apiBase?: string;
}

const translations = {
    en: {
        title: 'Comments',
        loading: 'Loading comments...',
        noComments: 'No comments yet. Be the first!',
        loadMore: 'Load More',
        leaveComment: 'Leave a Comment',
        placeholderName: 'Your Name',
        placeholderComment: 'Your Comment',
        postButton: 'Post Comment',
        successMsg: 'Comment submitted for checking! It will appear after approval.',
        errorMsg: 'Failed to submit comment.',
        networkError: 'Error submitting comment.'
    },
    es: {
        title: 'Comentarios',
        loading: 'Cargando comentarios...',
        noComments: 'Aún no hay comentarios. ¡Sé el primero!',
        loadMore: 'Cargar más',
        leaveComment: 'Deja un comentario',
        placeholderName: 'Tu Nombre',
        placeholderComment: 'Tu Comentario',
        postButton: 'Publicar Comentario',
        successMsg: '¡Comentario enviado para revisión! Aparecerá después de ser aprobado.',
        errorMsg: 'Error al enviar el comentario.',
        networkError: 'Error de red al enviar el comentario.'
    }
};

export default function Comments({ slug, lang = 'en', apiBase = import.meta.env.PUBLIC_COMMENTS_API }: CommentsProps) {
    if (!apiBase) {
        console.error("PUBLIC_COMMENTS_API is not defined. Please set it in your environment/build configuration.");
    }

    // Normalize lang to ensure we have a valid key, default to 'en'
    const currentLang = (lang && translations[lang as keyof typeof translations]) ? lang as keyof typeof translations : 'en';
    const t = translations[currentLang];

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
                setMessage(t.successMsg);
                setNewComment({ author: '', content: '' });
            } else {
                setMessage(t.errorMsg);
            }
        } catch (err) {
            setMessage(t.networkError);
        }
    };

    return (
        <div className="comments-section" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--gray-800)' }}>
            <h3 style={{ color: 'var(--gray-0)', marginBottom: '1rem' }}>{t.title}</h3>

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
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-300)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{comment.content}</div>
                    </div>
                ))}

                {loading && <p style={{ color: 'var(--gray-300)' }}>{t.loading}</p>}

                {!loading && comments.length === 0 && <p style={{ color: 'var(--gray-300)', fontStyle: 'italic' }}>{t.noComments}</p>}

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
                        {t.loadMore}
                    </button>
                )}
            </div>

            <div className="comment-form">
                <h4 style={{ color: 'var(--gray-0)', marginBottom: '1rem' }}>{t.leaveComment}</h4>
                {message && <p style={{ padding: '10px', background: 'var(--accent-subtle-overlay)', color: 'var(--accent-text-over)', borderRadius: '0.5rem' }}>{message}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder={t.placeholderName}
                        value={newComment.author}
                        onChange={e => setNewComment({ ...newComment, author: e.target.value })}
                        required
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--gray-700)',
                            background: 'var(--gray-950)',
                            color: 'var(--gray-0)',
                            fontFamily: 'inherit'
                        }}
                    />
                    <textarea
                        placeholder={t.placeholderComment}
                        value={newComment.content}
                        onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                        required
                        rows={4}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--gray-700)',
                            background: 'var(--gray-950)',
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
                        {t.postButton}
                    </button>
                </form>
            </div>
        </div>
    );
}
