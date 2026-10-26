import type { Lang } from "../../utils/routing";

export const LEGAL_PAGES = ["legal", "privacy", "cookies"] as const;
export type LegalPage = (typeof LEGAL_PAGES)[number];

interface LegalSection {
    title: string;
    /** Paragraphs are trusted HTML so they can carry links. */
    body: string[];
}

interface LegalContent {
    title: string;
    metaTitle: string;
    description: string;
    updated: string;
    sections: LegalSection[];
}

const CONTACT = '<a href="mailto:contact@antoniobermudez.dev">contact@antoniobermudez.dev</a>';
const UPDATED = "2026-10-26";

export const legalLinksI18n: Record<Lang, Record<LegalPage | "label", string>> = {
    es: { label: "Información legal", legal: "Aviso legal", privacy: "Privacidad", cookies: "Cookies" },
    en: { label: "Legal information", legal: "Legal notice", privacy: "Privacy", cookies: "Cookies" },
};

export const consentI18n = {
    es: {
        label: "Consentimiento de analítica",
        text: "Uso una analítica sin cookies para saber qué artículos se leen. Solo se activa si aceptas.",
        more: "Más información",
        accept: "Aceptar",
        reject: "Rechazar",
        acceptAnalytics: "Aceptar analítica",
        rejectAnalytics: "Rechazar analítica",
        current: "Tu elección actual",
        granted: "Aceptada",
        denied: "Rechazada",
        updated: "Última actualización",
    },
    en: {
        label: "Analytics consent",
        text: "I use cookie-free analytics to see which articles get read. It only runs if you accept.",
        more: "Learn more",
        accept: "Accept",
        reject: "Reject",
        acceptAnalytics: "Accept analytics",
        rejectAnalytics: "Reject analytics",
        current: "Your current choice",
        granted: "Accepted",
        denied: "Rejected",
        updated: "Last updated",
    },
} satisfies Record<Lang, Record<string, string>>;

export const legalI18n: Record<Lang, Record<LegalPage, LegalContent>> = {
    es: {
        legal: {
            title: "Aviso legal",
            metaTitle: "Aviso legal | Antonio Bermúdez",
            description: "Titular, condiciones de uso y propiedad intelectual de antoniobermudez.dev.",
            updated: UPDATED,
            sections: [
                {
                    title: "Titular",
                    body: [
                        `Este sitio web, antoniobermudez.dev, es un blog personal sin actividad comercial. Su titular es Antonio Bermúdez Rodríguez, con residencia en Málaga (España). Puedes escribirme a ${CONTACT}.`,
                    ],
                },
                {
                    title: "Uso del sitio",
                    body: [
                        "Puedes navegar por el sitio libremente. Al usarlo te comprometes a no hacer nada que dañe su funcionamiento ni a publicar comentarios ilícitos, ofensivos, publicitarios o que vulneren derechos de terceros. Los comentarios se revisan antes de publicarse y puedo rechazar o borrar cualquiera que no cumpla estas condiciones.",
                    ],
                },
                {
                    title: "Propiedad intelectual",
                    body: [
                        "Los textos, imágenes y diseños del sitio son de mi autoría salvo que se indique otra cosa. Puedes citarlos y enlazarlos indicando la fuente. Para reproducirlos completos o usarlos con fines comerciales, pídeme permiso antes.",
                        "Los fragmentos de código de los artículos se pueden usar libremente en tus proyectos, sin garantía de ningún tipo. Las marcas y logotipos de terceros que aparecen pertenecen a sus propietarios.",
                    ],
                },
                {
                    title: "Responsabilidad",
                    body: [
                        "Los artículos reflejan mi experiencia y opinión en el momento en que los escribí. Intento que sean correctos, pero no garantizo que estén libres de errores ni actualizados, así que revisa cualquier código o configuración antes de llevarlo a producción. Tampoco respondo del contenido de los sitios externos a los que enlazo.",
                    ],
                },
                {
                    title: "Legislación aplicable",
                    body: [
                        "Este aviso se rige por la legislación española. El tratamiento de datos personales se explica en la <a href=\"/es/privacy/\">política de privacidad</a> y el uso de almacenamiento local en la <a href=\"/es/cookies/\">política de cookies</a>.",
                    ],
                },
            ],
        },
        privacy: {
            title: "Política de privacidad",
            metaTitle: "Política de privacidad | Antonio Bermúdez",
            description: "Qué datos recoge antoniobermudez.dev, para qué los uso, cuánto tiempo los guardo y cómo ejercer tus derechos.",
            updated: UPDATED,
            sections: [
                {
                    title: "Responsable",
                    body: [
                        `El responsable del tratamiento es Antonio Bermúdez Rodríguez, titular de antoniobermudez.dev. Para cualquier cuestión sobre tus datos escríbeme a ${CONTACT}.`,
                    ],
                },
                {
                    title: "Comentarios",
                    body: [
                        "Si dejas un comentario guardo el nombre que escribas, el texto del comentario, el artículo en el que lo publicas y la fecha. No pido correo electrónico. El nombre y el comentario se publican en el artículo una vez los apruebo.",
                        "La base legal es tu consentimiento, que das al enviar el comentario. Los conservo mientras el comentario siga publicado o hasta que me pidas borrarlo. Cuando hay comentarios pendientes de revisar recibo un aviso por Telegram que solo indica en qué artículo hay comentarios y cuántos; no incluye tu nombre ni el texto.",
                    ],
                },
                {
                    title: "Newsletter",
                    body: [
                        "Si te suscribes a la newsletter guardo tu correo electrónico, el idioma que elijas, la fecha en que diste el consentimiento y la versión del texto que aceptaste. Solo la uso para enviarte la newsletter semanal. Hasta que no confirmas desde el enlace que te llega por correo no recibes nada, y si no confirmas, tu dirección se borra a los 7 días.",
                        "La base legal es tu consentimiento. Puedes darte de baja cuando quieras desde el enlace que aparece en cada correo, y tu dirección se borra a los 30 días de la baja. Los correos no llevan píxeles de seguimiento ni enlaces que registren si los abres o en qué pulsas.",
                        "Los datos se guardan en servidores que gestiono yo. Para entregar los correos uso un proveedor de envío de email que actúa como encargado del tratamiento y solo recibe tu dirección y el contenido de cada envío.",
                    ],
                },
                {
                    title: "Analítica",
                    body: [
                        "Uso Tempoo Analytics para saber qué páginas se visitan. Solo se activa si aceptas en el aviso de cookies. Registra la URL visitada, la página de procedencia, el tamaño de la ventana, la fecha y unos identificadores aleatorios de visitante y de sesión guardados en tu navegador. No usa cookies ni identifica quién eres, y respeta la opción «Do Not Track» del navegador.",
                        "La base legal es tu consentimiento. Puedes retirarlo cuando quieras desde el enlace «Cookies» del pie de página.",
                    ],
                },
                {
                    title: "Contacto por correo",
                    body: [
                        "Si me escribes por correo uso tu dirección y tu mensaje solo para responderte. Los conservo mientras dure la conversación y lo necesario después para atender lo que me hayas pedido.",
                    ],
                },
                {
                    title: "Proveedores",
                    body: [
                        "El sitio se sirve desde Cloudflare Pages. Cloudflare procesa la dirección IP de cada visita para entregar la página y protegerla de abusos. Los comentarios y las imágenes del blog se guardan en servidores que gestiono yo. No vendo ni cedo tus datos a terceros.",
                    ],
                },
                {
                    title: "Tus derechos",
                    body: [
                        `Puedes pedirme acceso, rectificación o supresión de tus datos, así como oponerte a su tratamiento, limitarlo o solicitar su portabilidad, escribiendo a ${CONTACT}. Si crees que no he atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">aepd.es</a>).`,
                    ],
                },
            ],
        },
        cookies: {
            title: "Política de cookies",
            metaTitle: "Política de cookies | Antonio Bermúdez",
            description: "Qué guarda antoniobermudez.dev en tu navegador y cómo aceptar o rechazar la analítica.",
            updated: UPDATED,
            sections: [
                {
                    title: "Qué guarda este sitio en tu navegador",
                    body: [
                        "Este sitio no usa cookies. Sí guarda algunos datos en el almacenamiento local del navegador (localStorage y sessionStorage), que a efectos legales se tratan igual que las cookies.",
                        "<strong>Necesarios</strong>, siempre activos: <code>theme</code> guarda si prefieres el tema claro u oscuro, <code>language</code> guarda el idioma que eliges y <code>consent</code> guarda tu respuesta al aviso de cookies.",
                        "<strong>Analítica</strong>, solo si aceptas: <code>tempoo_visitor</code> es un identificador aleatorio de visitante que se mantiene hasta que lo borres, y <code>tempoo_session</code> es un identificador de sesión que se borra al cerrar la pestaña. Los usa Tempoo Analytics para contar visitas, como se explica en la <a href=\"/es/privacy/\">política de privacidad</a>.",
                    ],
                },
                {
                    title: "Cómo cambiar tu elección",
                    body: [
                        "Puedes aceptar o rechazar la analítica en el aviso que aparece en tu primera visita y cambiar de opinión con el botón de esta página. También puedes borrar el almacenamiento del sitio desde la configuración de tu navegador.",
                    ],
                },
            ],
        },
    },
    en: {
        legal: {
            title: "Legal notice",
            metaTitle: "Legal notice | Antonio Bermúdez",
            description: "Owner, terms of use and intellectual property of antoniobermudez.dev.",
            updated: UPDATED,
            sections: [
                {
                    title: "Owner",
                    body: [
                        `This website, antoniobermudez.dev, is a personal, non-commercial blog. It is owned by Antonio Bermúdez Rodríguez, based in Málaga, Spain. You can reach me at ${CONTACT}.`,
                    ],
                },
                {
                    title: "Using the site",
                    body: [
                        "You are free to browse the site. By using it you agree not to interfere with how it works and not to post comments that are unlawful, offensive, promotional or that infringe the rights of others. Comments are reviewed before they are published, and I may reject or remove any that break these terms.",
                    ],
                },
                {
                    title: "Intellectual property",
                    body: [
                        "Unless stated otherwise, the texts, images and design of this site are my own. You can quote and link to them as long as you credit the source. Ask me first if you want to reproduce them in full or use them commercially.",
                        "Code snippets in the articles can be used freely in your projects, with no warranty of any kind. Third-party trademarks and logos belong to their owners.",
                    ],
                },
                {
                    title: "Liability",
                    body: [
                        "Articles reflect my experience and opinion at the time I wrote them. I try to keep them accurate, but I can't guarantee they are error-free or up to date, so review any code or configuration before taking it to production. I am not responsible for the content of external sites I link to.",
                    ],
                },
                {
                    title: "Governing law",
                    body: [
                        "This notice is governed by Spanish law. How personal data is handled is explained in the <a href=\"/en/privacy/\">privacy policy</a>, and the use of browser storage in the <a href=\"/en/cookies/\">cookie policy</a>.",
                    ],
                },
            ],
        },
        privacy: {
            title: "Privacy policy",
            metaTitle: "Privacy policy | Antonio Bermúdez",
            description: "What data antoniobermudez.dev collects, why, how long it is kept and how to exercise your rights.",
            updated: UPDATED,
            sections: [
                {
                    title: "Controller",
                    body: [
                        `The data controller is Antonio Bermúdez Rodríguez, owner of antoniobermudez.dev. For anything related to your data, write to ${CONTACT}.`,
                    ],
                },
                {
                    title: "Comments",
                    body: [
                        "If you leave a comment I store the name you enter, the comment text, the article it belongs to and the date. I don't ask for your email. Your name and comment are shown on the article once I approve them.",
                        "The legal basis is your consent, given when you submit the comment. I keep it for as long as the comment stays published or until you ask me to delete it. When comments are waiting for review I get a Telegram alert that only says which articles have pending comments and how many; it doesn't include your name or text.",
                    ],
                },
                {
                    title: "Newsletter",
                    body: [
                        "If you subscribe to the newsletter I store your email address, the language you choose, the date you gave consent and the version of the text you accepted. I only use it to send you the weekly newsletter. Nothing is sent until you confirm from the link in the email you receive, and if you don't confirm, your address is deleted after 7 days.",
                        "The legal basis is your consent. You can unsubscribe at any time from the link in every email, and your address is deleted 30 days after you unsubscribe. The emails have no tracking pixels and no links that record whether you open them or what you click.",
                        "The data is stored on servers I run myself. To deliver the emails I use an email sending provider that acts as a data processor and only receives your address and the content of each email.",
                    ],
                },
                {
                    title: "Analytics",
                    body: [
                        "I use Tempoo Analytics to see which pages are visited. It only runs if you accept it in the cookie notice. It records the page URL, the referring page, the window size, the date and random visitor and session IDs stored in your browser. It doesn't use cookies or identify who you are, and it respects your browser's Do Not Track setting.",
                        "The legal basis is your consent. You can withdraw it at any time from the \"Cookies\" link in the footer.",
                    ],
                },
                {
                    title: "Email",
                    body: [
                        "If you email me, I only use your address and message to reply. I keep them for as long as the conversation lasts and afterwards only as long as needed to deal with your request.",
                    ],
                },
                {
                    title: "Providers",
                    body: [
                        "The site is served from Cloudflare Pages. Cloudflare processes the IP address of each visit to deliver the page and protect it from abuse. Comments and blog images are stored on servers I run myself. I don't sell or share your data with third parties.",
                    ],
                },
                {
                    title: "Your rights",
                    body: [
                        `You can ask me for access to, correction or deletion of your data, object to or restrict its processing, or request a copy to take elsewhere, by writing to ${CONTACT}. If you think I haven't handled your request properly, you can complain to the Spanish Data Protection Agency (<a href="https://www.aepd.es" rel="noopener">aepd.es</a>).`,
                    ],
                },
            ],
        },
        cookies: {
            title: "Cookie policy",
            metaTitle: "Cookie policy | Antonio Bermúdez",
            description: "What antoniobermudez.dev stores in your browser and how to accept or reject analytics.",
            updated: UPDATED,
            sections: [
                {
                    title: "What this site stores in your browser",
                    body: [
                        "This site doesn't use cookies. It does store some data in your browser's local storage (localStorage and sessionStorage), which the law treats the same way as cookies.",
                        "<strong>Necessary</strong>, always on: <code>theme</code> remembers whether you prefer the light or dark theme, <code>language</code> remembers the language you pick and <code>consent</code> stores your answer to the cookie notice.",
                        "<strong>Analytics</strong>, only if you accept: <code>tempoo_visitor</code> is a random visitor ID kept until you clear it, and <code>tempoo_session</code> is a session ID removed when you close the tab. Tempoo Analytics uses them to count visits, as explained in the <a href=\"/en/privacy/\">privacy policy</a>.",
                    ],
                },
                {
                    title: "Changing your choice",
                    body: [
                        "You can accept or reject analytics in the notice shown on your first visit, and change your mind with the button on this page. You can also clear the site's storage from your browser settings.",
                    ],
                },
            ],
        },
    },
};
