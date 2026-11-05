import { servicesEs } from "./services.es";
import { servicesEn } from "./services.en";

export interface ServiceSection {
    id?: string;
    title: string;
    body?: string[];
    list?: string[];
    steps?: string[];
    after?: string[];
}

export interface ServicePage {
    /** Used in the JSON-LD `name`, `serviceType` and breadcrumbs. */
    serviceName: string;
    title: string;
    description: string;
    h1: string;
    intro: string[];
    notice?: string;
    cards?: { title: string; text: string; href: string }[];
    sections: ServiceSection[];
    faq?: { title: string; items: { question: string; answer: string }[] };
    cta: string;
}

export interface ServicesContent {
    home: string;
    services: string;
    allServices: string;
    seeService: string;
    ctaTitle: string;
    ctaText: string;
    pages: Record<string, ServicePage>;
}

export const servicesI18n = { es: servicesEs, en: servicesEn };

export const similarQuestion = {
    es: "¿Necesitas algo parecido?",
    en: "Need something similar?",
};

const technicalConsulting = {
    es: { label: "Consultoría tecnológica", href: "/es/servicios/consultoria-tecnologica/" },
    en: { label: "Fractional CTO and technical consulting", href: "/en/services/fractional-cto/" },
};

/** Projects on /work/, by collection id ("lang/slug"), and the closest service. */
const workServiceLinks: Record<string, { label: string; href: string }> = {
    "es/blazorsignalstore": technicalConsulting.es,
    "en/blazorsignalstore": technicalConsulting.en,
    "es/booking": technicalConsulting.es,
    "en/booking": technicalConsulting.en,
};

export const getWorkServiceLink = (id: string) => workServiceLinks[id];

/** Closing link of the articles that lead to a service, by collection id ("lang/slug"). */
export const articleServiceLinks: Record<string, { question: string; label: string; href: string }> = {
    "es/rag-chunking-strategies-guia-definitiva": {
        question: "¿Quieres un RAG sobre tus documentos?",
        label: "Mira cómo trabajo la integración de IA.",
        href: "/es/servicios/integracion-ia/",
    },
    "en/rag-chunking-strategies-guide": {
        question: "Want a RAG over your documents?",
        label: "See how I approach AI integration.",
        href: "/en/services/ai-integration/",
    },
    "es/tempoo-analytics": {
        question: "¿Te preocupa la protección de datos al usar IA?",
        label: "Así lo trato en la consultoría de IA.",
        href: "/es/servicios/consultoria-ia/#rgpd",
    },
    "en/tempoo-analytics": {
        question: "Want to apply the same care to AI?",
        label: "See how I approach GDPR-compliant AI.",
        href: "/en/services/gdpr-compliant-ai/",
    },
};
