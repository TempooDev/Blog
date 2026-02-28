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
        <div className="comments-section" style={{ 
            marginTop: '60px', 
            padding: '40px 0', 
            borderTop: '1px solid var(--blue-700)' 
        }}>
            <h3 style={{ color: 'var(--blue-0)', marginBottom: '2rem', fontSize: 'var(--text-2xl)' }}>{t.title}</h3>

            <div className="comments-list" style={{ marginBottom: '40px' }}>
                {comments.map((comment) => (
                    <div key={comment.id} className="comment-card" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--blue-700)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: '1rem', 
                            borderBottom: '1px solid var(--blue-700)', 
                            paddingBottom: '0.75rem' 
                        }}>
                            <strong style={{ color: 'var(--blue-0)', fontSize: 'var(--text-md)' }}>{comment.author}</strong>
                            <small style={{ color: 'var(--blue-300)' }}>{new Date(comment.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div style={{ 
                            whiteSpace: 'pre-wrap', 
                            color: 'var(--blue-100)', 
                            lineHeight: '1.6',
                            overflowWrap: 'anywhere', 
                            wordBreak: 'break-word' 
                        }}>{comment.content}</div>
                    </div>
                ))}

                {loading && <p style={{ color: 'var(--blue-300)', textAlign: 'center' }}>{t.loading}</p>}

                {!loading && comments.length === 0 && (
                    <p style={{ 
                        color: 'var(--blue-300)', 
                        fontStyle: 'italic', 
                        textAlign: 'center',
                        padding: '2rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '1rem',
                        border: '1px dashed var(--blue-600)'
                    }}>{t.noComments}</p>
                )}

                {hasMore && !loading && comments.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button onClick={handleLoadMore} style={{
                            padding: '0.6rem 1.5rem',
                            background: 'transparent',
                            color: 'var(--blue-200)',
                            border: '1px solid var(--blue-600)',
                            borderRadius: '999rem',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            transition: 'all var(--theme-transition)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--blue-700)';
                            e.currentTarget.style.borderColor = 'var(--blue-400)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--blue-600)';
                        }}
                        >
                            {t.loadMore}
                        </button>
                    </div>
                )}
            </div>

            <div className="comment-form" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid var(--blue-700)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h4 style={{ color: 'var(--blue-0)', marginBottom: '1.5rem', fontSize: 'var(--text-xl)' }}>{t.leaveComment}</h4>
                {message && (
                    <div style={{ 
                        padding: '1rem', 
                        marginBottom: '1.5rem',
                        background: 'var(--accent-overlay)', 
                        color: 'var(--blue-0)', 
                        borderRadius: '0.75rem',
                        border: '1px solid var(--accent-regular)',
                        fontSize: 'var(--text-sm)'
                    }}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="author" style={{ color: 'var(--blue-200)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>{t.placeholderName}</label>
                        <input
                            id="author"
                            type="text"
                            placeholder="E.g. Antonio Bermúdez"
                            value={newComment.author}
                            onChange={e => setNewComment({ ...newComment, author: e.target.value })}
                            required
                            style={{
                                padding: '0.85rem 1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid var(--blue-600)',
                                background: 'var(--blue-800)',
                                color: 'var(--blue-0)',
                                fontFamily: 'inherit',
                                fontSize: 'var(--text-md)',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-regular)';
                                e.target.style.background = 'var(--blue-700)';
                                e.target.style.boxShadow = '0 0 0 4px var(--accent-overlay)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--blue-600)';
                                e.target.style.background = 'var(--blue-800)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="content" style={{ color: 'var(--blue-200)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>{t.placeholderComment}</label>
                        <textarea
                            id="content"
                            placeholder="Write your thoughts here..."
                            value={newComment.content}
                            onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                            required
                            rows={5}
                            style={{
                                padding: '0.85rem 1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid var(--blue-600)',
                                background: 'var(--blue-800)',
                                color: 'var(--blue-0)',
                                fontFamily: 'inherit',
                                fontSize: 'var(--text-md)',
                                resize: 'vertical',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-regular)';
                                e.target.style.background = 'var(--blue-700)';
                                e.target.style.boxShadow = '0 0 0 4px var(--accent-overlay)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--blue-600)';
                                e.target.style.background = 'var(--blue-800)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <button type="submit" style={{
                        padding: '1rem 2rem',
                        marginTop: '0.5rem',
                        background: 'var(--accent-regular)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '999rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: 'var(--text-md)',
                        width: 'fit-content',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.1s ease, background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-dark)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent-regular)'}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {t.postButton}
                    </button>
                </form>
            </div>
        </div>
    );
}
