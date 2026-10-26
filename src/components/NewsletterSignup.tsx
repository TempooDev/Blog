import React, { useState, useEffect } from 'react';

interface NewsletterSignupProps {
    lang?: string;
    apiBase?: string;
    /** Show the result of the confirm/unsubscribe links (?status=...) — only on the newsletter page. */
    showStatus?: boolean;
}

const translations = {
    en: {
        title: 'Weekly AI & tech newsletter',
        text: 'Every Monday, the week\'s most relevant AI and tech news, summarised with sources and why each one matters.',
        placeholder: 'you@example.com',
        emailLabel: 'Email',
        langLabel: 'Language of the issues',
        consent: 'I want to receive the weekly newsletter and I accept the',
        privacyLink: 'privacy policy',
        button: 'Subscribe',
        sending: 'Sending...',
        success: 'Almost done: check your inbox and confirm your subscription.',
        error: 'Could not subscribe. Check the address and try again.',
        tooMany: 'Too many attempts. Try again later.',
        status: {
            confirmed: 'Subscription confirmed. The next issue will reach you on Monday.',
            unsubscribed: 'You have been unsubscribed. You won\'t get any more emails.',
            invalid: 'That link is not valid or has expired. Subscribe again if you want.',
        },
    },
    es: {
        title: 'Newsletter semanal de IA y tecnología',
        text: 'Cada lunes, las noticias de IA y tecnología más relevantes de la semana, resumidas con su fuente y por qué importan.',
        placeholder: 'tu@correo.com',
        emailLabel: 'Correo electrónico',
        langLabel: 'Idioma de los números',
        consent: 'Quiero recibir la newsletter semanal y acepto la',
        privacyLink: 'política de privacidad',
        button: 'Suscribirme',
        sending: 'Enviando...',
        success: 'Casi está: revisa tu correo y confirma la suscripción.',
        error: 'No se ha podido completar la suscripción. Revisa la dirección e inténtalo de nuevo.',
        tooMany: 'Demasiados intentos. Prueba más tarde.',
        status: {
            confirmed: 'Suscripción confirmada. El próximo número te llegará el lunes.',
            unsubscribed: 'Te has dado de baja. No recibirás más correos.',
            invalid: 'El enlace no es válido o ha caducado. Si quieres, suscríbete de nuevo.',
        },
    },
};

// Tempoo Analytics only loads after analytics consent, so without it this does nothing.
// The script loads async, so wait a few seconds for it before giving up.
function trackEvent(name: string, data: Record<string, string>, attempts = 10) {
    const tempoo = (window as any).tempoo;
    if (tempoo?.track) {
        tempoo.track(name, data);
    } else if (attempts > 0) {
        setTimeout(() => trackEvent(name, data, attempts - 1), 500);
    }
}

const languageNames = { es: 'Español', en: 'English' };

const inputStyle: React.CSSProperties = {
    padding: '0.85rem 1rem',
    borderRadius: '0.75rem',
    border: '2px solid var(--blue-600)',
    background: 'var(--blue-800)',
    color: 'var(--blue-0)',
    fontFamily: 'inherit',
    fontSize: 'var(--text-md)',
    outline: 'none',
    flex: '1 1 16rem',
    minWidth: 0,
};

export default function NewsletterSignup({ lang = 'en', apiBase = import.meta.env.PUBLIC_COMMENTS_API, showStatus = false }: NewsletterSignupProps) {
    const currentLang = (lang && translations[lang as keyof typeof translations]) ? lang as keyof typeof translations : 'en';
    const t = translations[currentLang];

    const [email, setEmail] = useState('');
    const [issueLang, setIssueLang] = useState<keyof typeof translations>(currentLang);
    const [consent, setConsent] = useState(false);
    const [website, setWebsite] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!showStatus) return;
        const status = new URLSearchParams(window.location.search).get('status');
        if (status && status in t.status) {
            setMessage(t.status[status as keyof typeof t.status]);
            if (status === 'confirmed') trackEvent('newsletter_confirmed', { lang: currentLang });
        }
    }, [showStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiBase || !email || !consent) return;
        setSending(true);
        try {
            const res = await fetch(`${apiBase}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, lang: issueLang, consent, website }),
            });
            if (res.ok) {
                trackEvent('newsletter_signup', { lang: issueLang, page: window.location.pathname });
                setMessage(t.success);
                setEmail('');
                setConsent(false);
            } else {
                setMessage(res.status === 429 ? t.tooMany : t.error);
            }
        } catch {
            setMessage(t.error);
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="newsletter-signup" aria-labelledby="newsletter-title" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '2rem',
            borderRadius: '1.5rem',
            border: '1px solid var(--blue-700)',
            boxShadow: 'var(--shadow-md)',
        }}>
            <h2 id="newsletter-title" style={{ color: 'var(--blue-0)', marginBottom: '0.75rem', fontSize: 'var(--text-xl)' }}>{t.title}</h2>
            <p style={{ color: 'var(--blue-200)', marginBottom: '1.5rem' }}>{t.text}</p>
            {message && (
                <div role="status" style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: 'var(--accent-overlay)',
                    color: 'var(--blue-0)',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--accent-regular)',
                    fontSize: 'var(--text-sm)',
                }}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <label htmlFor="newsletter-email" className="sr-only">{t.emailLabel}</label>
                    <input
                        id="newsletter-email"
                        type="email"
                        autoComplete="email"
                        placeholder={t.placeholder}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <label htmlFor="newsletter-lang" className="sr-only">{t.langLabel}</label>
                    <select
                        id="newsletter-lang"
                        value={issueLang}
                        onChange={e => setIssueLang(e.target.value as keyof typeof translations)}
                        title={t.langLabel}
                        style={{ ...inputStyle, flex: '0 0 auto', cursor: 'pointer' }}
                    >
                        {Object.entries(languageNames).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                    <button type="submit" disabled={sending} style={{
                        padding: '0.85rem 1.75rem',
                        background: 'var(--accent-regular)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '999rem',
                        cursor: sending ? 'wait' : 'pointer',
                        fontWeight: '600',
                        fontSize: 'var(--text-md)',
                    }}>
                        {sending ? t.sending : t.button}
                    </button>
                </div>
                {/* Honeypot: hidden from people, bots tend to fill it */}
                <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', opacity: 0 }}
                />
                <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--gray-400)' }}>
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required style={{ marginTop: '0.2rem' }} />
                    <span>
                        {t.consent} <a href={`/${currentLang}/privacy/`} style={{ textDecoration: 'underline' }}>{t.privacyLink}</a>.
                    </span>
                </label>
            </form>
        </section>
    );
}
