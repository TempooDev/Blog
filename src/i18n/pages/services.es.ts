import type { ServicesContent } from "./services";

const RAG = "/es/blog/rag-chunking-strategies-guia-definitiva/";
const TEMPOO = "/es/blog/tempoo-analytics/";

const priceAnswer =
    "Depende del alcance, así que no publico una tarifa cerrada. El precio lo determinan sobre todo cuántos procesos o sistemas entran, cómo de accesible está la información y si hay que dejar algo en producción. Te lo presupuesto después de una primera conversación, cuando ya sé qué necesitas.";

export const servicesEs: ServicesContent = {
    home: "Inicio",
    services: "Servicios",
    allServices: "Todos los servicios",
    seeService: "Ver servicio",
    ctaTitle: "Reserva una llamada",
    ctaText: "Elige un hueco en mi calendario y vemos tu caso.",
    pages: {
        index: {
            serviceName: "Consultoría de IA y tecnológica",
            title: "Consultor IA y consultoría tecnológica para pymes y startups | Antonio Bermúdez",
            description:
                "Consultoría de inteligencia artificial, integración de IA, automatización y consultoría tecnológica para pymes y startups. En remoto para España y Europa.",
            h1: "Consultor de IA y consultoría tecnológica para pymes y startups",
            intro: [
                "Soy Antonio Bermúdez, ingeniero informático en Málaga. Ayudo a pymes y startups a decidir dónde tiene sentido la IA, a integrarla en sus sistemas y a resolver la parte técnica de su producto. Trabajo en remoto, para España y el resto de Europa.",
            ],
            cards: [
                {
                    title: "Consultoría de IA",
                    text: "Detectamos dónde la IA te ahorra tiempo o dinero y qué necesitas para implantarla con criterio.",
                    href: "/es/servicios/consultoria-ia/",
                },
                {
                    title: "Integración de IA",
                    text: "Agentes, búsqueda sobre tus documentos (RAG) y chatbots a medida, conectados con tus sistemas.",
                    href: "/es/servicios/integracion-ia/",
                },
                {
                    title: "Automatización con IA",
                    text: "De un proceso manual y repetitivo a uno automático, con tus herramientas y con revisión humana donde haga falta.",
                    href: "/es/servicios/automatizacion-ia/",
                },
                {
                    title: "Consultoría tecnológica",
                    text: "CTO as a service, desarrollo de MVP, software a medida y revisión de arquitectura.",
                    href: "/es/servicios/consultoria-tecnologica/",
                },
            ],
            sections: [
                {
                    title: "Cómo trabajo",
                    steps: [
                        "<strong>Diagnóstico.</strong> Entiendo tu negocio, tus procesos y lo que ya tienes montado.",
                        "<strong>Propuesta.</strong> Te digo qué haría, en qué orden y qué dejaría fuera, con un presupuesto.",
                        "<strong>Implementación.</strong> Lo construyo e integro con tus sistemas, por entregas pequeñas que puedas revisar.",
                        "<strong>Acompañamiento.</strong> Ajustamos lo que haga falta cuando ya está en uso.",
                    ],
                },
                {
                    title: "Proyectos",
                    body: [
                        `Lo que sé hacer se puede leer. En <a href="/es/work/">Proyectos</a> están BlazorSignalStore, una librería de gestión de estado para Blazor, y booking, un sistema de reservas hoteleras con microservicios en .NET Aspire y Azure. <a href="${TEMPOO}">Tempoo Analytics</a> es mi herramienta de analítica web: la desarrollo yo solo, con .NET y Go, y los datos se quedan en la Unión Europea.`,
                    ],
                },
            ],
            cta: "Cuéntame tu proyecto",
        },

        "ai-consulting": {
            serviceName: "Consultoría de IA",
            title: "Consultoría IA para pymes y startups: consultor de inteligencia artificial",
            description:
                "Consultor de IA para pymes y startups: detecto dónde la inteligencia artificial ahorra tiempo o dinero en tu empresa y te ayudo a implantarla con criterio.",
            h1: "Consultoría de IA para pymes y startups",
            intro: [
                "Antes de contratar una herramienta de IA conviene saber qué problema va a resolver. La consultoría sirve para eso: encontrar los casos en los que la IA te compensa, descartar los que no y salir con un plan que se pueda ejecutar.",
            ],
            sections: [
                {
                    title: "Qué hace un consultor de IA (y qué no)",
                    body: [
                        "Mi trabajo es responder a tres preguntas: en qué procesos de tu empresa la inteligencia artificial ahorra tiempo o dinero, qué herramienta o modelo encaja en cada caso y qué hace falta para ponerlo en marcha sin riesgos innecesarios.",
                        "Lo que no hago es venderte IA porque toque. Si algo se resuelve mejor con una regla, una consulta o un cambio de proceso, te lo digo. Tampoco te prometo resultados antes de haber visto tus datos.",
                    ],
                },
                {
                    title: "Para quién es: pymes y startups",
                    body: [
                        "<strong>Pymes</strong> que tienen tareas repetitivas o mucho conocimiento repartido en documentos y correos, y no cuentan con un equipo técnico que pueda dedicar tiempo a evaluar opciones.",
                        "<strong>Startups</strong> que quieren meter IA en su producto y necesitan decidir qué modelo usar, cómo conectarlo con sus datos y qué coste y qué riesgos asumen.",
                    ],
                },
                {
                    title: "Qué incluye",
                    list: [
                        "Diagnóstico de procesos: dónde se va el tiempo y qué datos hay disponibles.",
                        "Casos de uso priorizados según su impacto, su dificultad y su riesgo.",
                        `Elección de herramientas o modelos: LLM, RAG o agentes, y cuándo no hace falta ninguno. Si tu caso pasa por RAG, en <a href="${RAG}">esta guía de chunking</a> explico una de las decisiones que más pesan en la calidad de las respuestas.`,
                        "Plan de implantación: qué se hace primero, qué se necesita y cómo se comprueba que funciona.",
                    ],
                    after: [
                        `La implementación se contrata aparte, como <a href="/es/servicios/integracion-ia/">integración de IA</a> o <a href="/es/servicios/automatizacion-ia/">automatización con IA</a>.`,
                    ],
                },
                {
                    id: "rgpd",
                    title: "IA y protección de datos (RGPD)",
                    body: [
                        "Enviar datos a un modelo es un tratamiento de datos como cualquier otro, así que forma parte del diagnóstico desde el principio. Reviso tres cosas:",
                    ],
                    list: [
                        "<strong>Datos en la UE:</strong> dónde se alojan y se procesan, y si hay transferencias fuera de la Unión.",
                        "<strong>Minimización:</strong> qué datos necesita de verdad el sistema y qué se puede quitar o anonimizar antes de enviarlo.",
                        "<strong>Proveedores:</strong> qué hace cada uno con tus datos y qué contrato de encargo de tratamiento ofrece.",
                    ],
                    after: [
                        `Es un criterio que aplico también en mis proyectos: <a href="${TEMPOO}">Tempoo Analytics</a> no guarda la IP completa y sus servidores están en la Unión Europea. Esto es orientación técnica, no asesoramiento legal: las decisiones jurídicas corresponden a tu asesor o a tu delegado de protección de datos.`,
                    ],
                },
                {
                    title: "Cómo trabajo",
                    steps: [
                        "<strong>Diagnóstico.</strong> Reviso contigo los procesos, los datos y lo que ya usáis.",
                        "<strong>Propuesta.</strong> Te presento los casos priorizados y el plan.",
                        "<strong>Implementación.</strong> Si decides seguir conmigo, la hacemos como un proyecto aparte.",
                        "<strong>Acompañamiento.</strong> Revisamos lo implantado y ajustamos el plan.",
                    ],
                    after: ["Todo el trabajo es en remoto, para empresas de España y del resto de Europa."],
                },
            ],
            faq: {
                title: "Preguntas frecuentes",
                items: [
                    { question: "¿Cuánto cuesta una consultoría de IA?", answer: priceAnswer },
                    {
                        question: "¿Necesito datos propios?",
                        answer: "Depende del caso. Un asistente sobre tu documentación necesita esa documentación, aunque no hace falta que esté perfecta para empezar. Otras tareas, como resumir o clasificar textos, pueden arrancar con un modelo general. Lo vemos en el diagnóstico.",
                    },
                    {
                        question: "¿Cuánto se tarda?",
                        answer: "Depende de cuántos procesos revisemos y de lo fácil que sea acceder a la información. Te doy un plazo concreto en la propuesta.",
                    },
                    {
                        question: "¿Necesito tener equipo técnico?",
                        answer: "No. Si no lo tienes, el plan lo tiene en cuenta y te explico cada decisión sin jerga. Si lo tienes, trabajo con él.",
                    },
                    {
                        question: "¿Estoy obligado a contratarte la implementación?",
                        answer: "No. El plan está pensado para que lo pueda ejecutar tu equipo o cualquier otro proveedor.",
                    },
                ],
            },
            cta: "Pide un diagnóstico de IA",
        },

        "ai-integration": {
            serviceName: "Integración de IA",
            title: "Integración de IA en tu empresa: agentes de IA, RAG y chatbots a medida",
            description:
                "Integro inteligencia artificial en tus aplicaciones y procesos: agentes de IA para empresas, búsqueda sobre tus documentos (RAG) y chatbots a medida.",
            h1: "Integración de IA: agentes, RAG y chatbots para empresas",
            intro: [
                "Una demo con un modelo se monta en una tarde. Lo difícil viene después: que use tus datos, que se conecte con tus sistemas, que falle de forma controlada y que puedas saber por qué ha respondido lo que ha respondido. De eso va este servicio.",
            ],
            sections: [
                {
                    title: "Agentes de IA para empresas",
                    body: [
                        "Un agente es un modelo que, además de responder, puede usar herramientas: consultar una base de datos, llamar a una API o crear un registro en tu sistema. Sirve para tareas de varios pasos que hoy hace una persona saltando de una aplicación a otra.",
                        "Lo importante es acotarlo. Defino qué puede hacer, qué acciones necesitan una confirmación humana y qué queda registrado, para que el agente no tome decisiones que nadie pueda revisar.",
                    ],
                },
                {
                    title: "RAG: respuestas sobre tus propios documentos",
                    body: [
                        "RAG conecta un modelo con tu documentación sin reentrenarlo: busca los fragmentos relevantes y responde a partir de ellos, de modo que puede citar la fuente y se actualiza con solo reindexar el documento.",
                        `La calidad depende mucho de cómo se trocean los documentos, y por eso le dediqué una <a href="${RAG}">guía sobre estrategias de chunking</a>. Antes de elegir modelo reviso el tipo de documentos que tienes, el coste y la latencia que puedes asumir.`,
                    ],
                },
                {
                    title: "Chatbots a medida (no plantillas)",
                    body: [
                        "Un chatbot de plantilla contesta a todo lo que le preguntan, aunque no lo sepa. Uno a medida responde con tu información, dice que no sabe cuando no tiene la respuesta y pasa la conversación a una persona cuando toca. Se puede usar para atención al cliente, para soporte interno o dentro de tu producto.",
                    ],
                },
                {
                    title: "Integración con tus sistemas",
                    body: [
                        "La IA aporta poco si vive aislada. La conecto con lo que ya tienes a través de APIs, aplicaciones .NET y bases de datos, con autenticación, permisos y registro de lo que ocurre, como cualquier otra parte de tu software.",
                        `En <a href="/es/work/">mis proyectos</a> puedes ver cómo planteo sistemas con servicios que se comunican de forma asíncrona, como el de reservas hoteleras con .NET Aspire y Azure Service Bus.`,
                    ],
                },
                {
                    title: "Stack habitual",
                    body: [
                        "Trabajo con .NET, Azure, Semantic Kernel, Go, APIs de modelos (LLM) y RAG. Si ya tienes un stack, me adapto a él siempre que tenga sentido; no hace falta rehacer nada para empezar.",
                    ],
                },
                {
                    title: "Privacidad y RGPD",
                    body: [
                        "Decido contigo qué datos llegan al modelo, dónde se procesan y qué proveedor se usa, buscando alojamiento en la UE y enviando solo lo imprescindible. Si aún no tienes claro qué hacer, empieza por la <a href=\"/es/servicios/consultoria-ia/\">consultoría de IA</a>, donde este análisis tiene su propia sección. Es orientación técnica, no asesoramiento legal.",
                    ],
                },
            ],
            faq: {
                title: "Preguntas frecuentes",
                items: [
                    { question: "¿Cuánto cuesta integrar IA en mi empresa?", answer: priceAnswer },
                    {
                        question: "¿Qué modelo de IA es mejor?",
                        answer: "Depende de la tarea, del coste por uso, de la latencia y de dónde se procesen los datos. Procuro que el modelo se pueda cambiar sin rehacer el sistema, porque este mercado se mueve rápido.",
                    },
                    {
                        question: "¿Se puede integrar con mi aplicación actual?",
                        answer: "En general sí, si la aplicación tiene una API o una base de datos accesible. Si no la tiene, vemos qué hace falta añadir antes de empezar.",
                    },
                    {
                        question: "¿Cómo se evita que invente respuestas?",
                        answer: "No se puede eliminar del todo, pero se reduce mucho: limitando las respuestas a tus documentos, mostrando la fuente, dejando que diga que no lo sabe y probándolo con preguntas reales de tu negocio.",
                    },
                ],
            },
            cta: "Hablemos de tu integración",
        },

        "ai-automation": {
            serviceName: "Automatización con IA",
            title: "Automatización con IA: automatización de procesos para pymes",
            description:
                "Automatización de procesos con IA para pymes y startups: elimino tareas repetitivas (correo, documentos, atención, informes) conectando IA con tus herramientas.",
            h1: "Automatización de procesos con IA",
            intro: [
                "Muchas tareas repetitivas no se habían podido automatizar porque había que leer un texto y entenderlo. La IA cubre esa parte. Mi trabajo consiste en conectarla con las herramientas que ya usas para que el proceso funcione de principio a fin, con una persona revisando donde haga falta.",
            ],
            sections: [
                {
                    title: "Qué procesos se pueden automatizar con IA",
                    list: [
                        "<strong>Correo:</strong> clasificar lo que entra, extraer los datos y preparar un borrador de respuesta.",
                        "<strong>Documentos:</strong> leer facturas, contratos o formularios y pasar los datos a tu sistema.",
                        "<strong>Atención al cliente:</strong> responder a las preguntas habituales con tu información y derivar el resto.",
                        "<strong>Informes:</strong> reunir datos de varias fuentes y redactar un resumen periódico.",
                    ],
                    after: ["Son ejemplos habituales, no una lista cerrada. Suelen ser buenos candidatos los procesos frecuentes, con reglas más o menos claras y en los que un error se puede detectar y corregir."],
                },
                {
                    title: "Cómo lo hago: de un proceso manual a uno automático",
                    steps: [
                        "<strong>Diagnóstico.</strong> Vemos cómo se hace hoy el proceso, con ejemplos reales y sus excepciones.",
                        "<strong>Propuesta.</strong> Decidimos qué se automatiza, qué sigue en manos de una persona y cómo se medirá.",
                        "<strong>Implementación.</strong> Lo construyo y lo pruebo con casos reales antes de darle autonomía.",
                        "<strong>Acompañamiento.</strong> Revisamos los fallos y ajustamos lo que haga falta.",
                    ],
                },
                {
                    title: "Herramientas y conexión con tu software",
                    body: [
                        "Empiezo por lo que ya usas: tu correo, tu CRM, tu ERP o tus hojas de cálculo. Si tienen API, la conexión es directa. Si no, buscamos otra vía o valoramos si merece la pena. El desarrollo lo adapto al caso, desde una integración sencilla hasta un servicio propio, y si la automatización necesita algo más complejo pasa a ser un proyecto de <a href=\"/es/servicios/integracion-ia/\">integración de IA</a>.",
                    ],
                },
                {
                    title: "Cuándo NO conviene automatizar",
                    list: [
                        "Cuando el proceso cambia cada poco o nadie sabe explicar cómo se hace.",
                        "Cuando se hace tan pocas veces que automatizarlo cuesta más de lo que ahorra.",
                        "Cuando un error tiene consecuencias graves y no hay nadie revisando el resultado.",
                        "Cuando una regla sencilla lo resuelve: entonces no hace falta IA, y sale más barato y más fiable.",
                    ],
                    after: ["Si tu caso es uno de estos, te lo digo antes de presupuestar nada."],
                },
            ],
            faq: {
                title: "Preguntas frecuentes",
                items: [
                    { question: "¿Cuánto cuesta automatizar un proceso con IA?", answer: priceAnswer },
                    {
                        question: "¿Qué pasa si la IA se equivoca?",
                        answer: "Se equivocará alguna vez, así que el proceso se diseña contando con ello: validaciones automáticas, revisión humana en los pasos delicados y registro de lo que ha hecho para poder corregirlo.",
                    },
                    {
                        question: "¿Tengo que cambiar mis herramientas?",
                        answer: "Normalmente no. La idea es conectar lo que ya usas. Solo te propondría un cambio si una herramienta impide hacerlo, y te explicaría por qué.",
                    },
                    {
                        question: "¿Cumple con el RGPD?",
                        answer: "Depende de qué datos se traten y de los proveedores que se elijan. Lo tengo en cuenta en el diseño, buscando procesar en la UE y enviar solo lo necesario, aunque la valoración legal corresponde a tu asesor.",
                    },
                ],
            },
            cta: "Revisemos qué puedes automatizar",
        },

        "technical-consulting": {
            serviceName: "Consultoría tecnológica",
            title: "Consultoría tecnológica para startups y pymes: CTO as a service y MVP",
            description:
                "Consultor tecnológico para startups y pymes: arquitectura, desarrollo de software a medida, MVP y CTO as a service en remoto. Experiencia en .NET y Azure.",
            h1: "Consultoría tecnológica y CTO as a service",
            intro: [
                "Hay decisiones técnicas que condicionan un producto durante años y que a menudo se toman sin nadie con experiencia en la sala. Te ayudo a tomarlas bien, y también a construir lo que haga falta, en remoto y con la dedicación que tenga sentido para tu empresa.",
            ],
            sections: [
                {
                    title: "CTO as a service para startups",
                    body: [
                        "Si todavía no necesitas un CTO a tiempo completo, puedo asumir esa función con una dedicación parcial: decidir el stack, revisar la arquitectura, ordenar las prioridades técnicas y ayudarte a hablar con proveedores o a contratar a tus primeros desarrolladores.",
                    ],
                },
                {
                    title: "Desarrollo de MVP",
                    body: [
                        `Un MVP tiene que salir pronto sin cerrarte el camino después. He escrito sobre las dos partes: <a href="/es/blog/mi-tech-stack-personal-para-proyectos-rapidos-en-2026/">el stack que uso para lanzar proyectos rápidos</a> y <a href="/es/blog/de-cero-a-produccion-2026/">cómo desplegarlos sin que el hosting se coma el presupuesto</a>. Con ese enfoque construyo y mantengo <a href="${TEMPOO}">Tempoo Analytics</a>, un producto que llevo yo solo.`,
                    ],
                },
                {
                    title: "Desarrollo de software a medida",
                    body: [
                        "Cuando una herramienta estándar no encaja con tu forma de trabajar, desarrollo la pieza que falta: aplicaciones internas, APIs o integraciones entre sistemas. Antes de escribir código compruebo que no exista ya algo que te resuelva el problema por menos dinero.",
                    ],
                },
                {
                    title: "Arquitectura y revisión técnica",
                    body: [
                        `Reviso tu sistema o tu diseño y te digo qué cambiaría, qué dejaría como está y por qué. He escrito sobre <a href="/es/blog/arquitectura-vertical-slice/">arquitectura vertical slice</a> y <a href="/es/blog/arquitectura-orientada-a-eventos/">arquitectura orientada a eventos</a> a partir de <a href="/es/work/booking/">booking</a>, mi proyecto de reservas hoteleras, pero no aplico un patrón por defecto: la arquitectura tiene que encajar con el tamaño de tu equipo y de tu producto.`,
                    ],
                },
                {
                    title: "Modernización de aplicaciones .NET",
                    body: [
                        "Si tienes una aplicación .NET antigua que cuesta mantener, la migración no tiene por qué ser un salto al vacío. Primero vemos qué partes dan más problemas y luego las movemos por etapas a versiones actuales de .NET, con la aplicación funcionando durante el proceso.",
                    ],
                },
            ],
            faq: {
                title: "Preguntas frecuentes",
                items: [
                    { question: "¿Cuánto cuesta la consultoría tecnológica?", answer: priceAnswer },
                    {
                        question: "¿Qué diferencia hay entre un CTO as a service y un consultor?",
                        answer: "Un consultor resuelve una pregunta o un proyecto concreto. Un CTO as a service asume de forma continuada la responsabilidad técnica, con una dedicación parcial.",
                    },
                    {
                        question: "¿Solo trabajas con .NET?",
                        answer: `Es donde tengo más experiencia, junto con Azure, pero también uso Go: la ingesta de <a href="${TEMPOO}">Tempoo Analytics</a> está escrita en Go. Si tu stack es otro, te digo con franqueza si soy la persona adecuada.`,
                    },
                    {
                        question: "¿Te encargas también del desarrollo o solo asesoras?",
                        answer: "Las dos cosas. Puedo limitarme a revisar y decidir contigo, o construir el producto o la parte que necesites.",
                    },
                ],
            },
            cta: "Agenda una sesión técnica",
        },
    },
};
