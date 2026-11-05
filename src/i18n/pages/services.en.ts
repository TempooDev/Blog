import type { ServicesContent } from "./services";

const RAG = "/en/blog/rag-chunking-strategies-guide/";
const TEMPOO = "/en/blog/tempoo-analytics/";
const GDPR = "/en/services/gdpr-compliant-ai/";

const priceAnswer =
    "It depends on the scope, so I don't publish a fixed rate. The price mainly comes down to how many processes or systems are involved, how accessible the information is and whether something has to be running in production. I'll give you a quote after a first conversation, once I know what you need.";

export const servicesEn: ServicesContent = {
    home: "Home",
    services: "Services",
    allServices: "All services",
    seeService: "See service",
    ctaTitle: "Book a call",
    ctaText: "Pick a slot in my calendar and we'll go through your case.",
    pages: {
        index: {
            serviceName: "AI and technical consulting",
            title: "AI consultant & technical consulting for SMEs and startups | Antonio Bermúdez",
            description:
                "AI consulting, AI integration, AI automation and fractional CTO services for SMEs and startups across Europe. Remote, GDPR-minded.",
            h1: "AI consultant and technical consulting for SMEs and startups",
            intro: [
                "I'm Antonio Bermúdez, a computer engineer based in Málaga, Spain. I help SMEs and startups decide where AI makes sense, integrate it into their systems and sort out the technical side of their product. I work remotely, across Spain and the rest of Europe.",
            ],
            cards: [
                {
                    title: "AI consulting",
                    text: "We find where AI saves you time or money, and what it takes to roll it out sensibly.",
                    href: "/en/services/ai-consulting/",
                },
                {
                    title: "AI integration",
                    text: "AI agents, LLM integration, RAG over your documents and custom chatbots, connected to your systems.",
                    href: "/en/services/ai-integration/",
                },
                {
                    title: "AI automation",
                    text: "From a repetitive manual process to an automated one, using your tools and keeping a human in the loop where it matters.",
                    href: "/en/services/ai-automation/",
                },
                {
                    title: "Fractional CTO",
                    text: "Part-time technical leadership, MVP development, .NET consulting and architecture reviews.",
                    href: "/en/services/fractional-cto/",
                },
                {
                    title: "GDPR-compliant AI",
                    text: "EU data residency, data minimisation and vendor choice for AI systems in European companies.",
                    href: GDPR,
                },
            ],
            sections: [
                {
                    title: "How I work",
                    steps: [
                        "<strong>Assessment.</strong> I get to know your business, your processes and what you already have in place.",
                        "<strong>Proposal.</strong> I tell you what I would do, in what order and what I would leave out, with a quote.",
                        "<strong>Implementation.</strong> I build it and integrate it with your systems, in small deliveries you can review.",
                        "<strong>Ongoing support.</strong> We adjust whatever needs adjusting once it's in use.",
                    ],
                },
                {
                    title: "Projects",
                    body: [
                        `You can read what I build. <a href="/en/work/">My work page</a> covers BlazorSignalStore, a state management library for Blazor, and booking, a hotel reservation system with microservices on .NET Aspire and Azure. <a href="${TEMPOO}">Tempoo Analytics</a> is my web analytics tool: I develop it on my own, with .NET and Go, and the data stays in the European Union.`,
                    ],
                },
            ],
            cta: "Tell me about your project",
        },

        "ai-consulting": {
            serviceName: "AI consulting",
            title: "AI consulting for SMEs and startups | Independent AI consultant in Europe",
            description:
                "Independent AI consultant for SMEs and startups: find where AI saves time or money, choose the right models and tools, and roll it out safely.",
            h1: "AI consulting for SMEs and startups",
            intro: [
                "Before paying for an AI tool, it helps to know which problem it's going to solve. That's what consulting is for: finding the cases where AI pays off, ruling out the ones where it doesn't and leaving with a plan you can actually carry out.",
            ],
            sections: [
                {
                    title: "What an AI consultant does (and doesn't)",
                    body: [
                        "My job is to answer three questions: which of your processes AI can save time or money on, which tool or model fits each case, and what it takes to get it running without unnecessary risk.",
                        "What I won't do is sell you AI for the sake of it. If something is better solved with a rule, a query or a change of process, I'll tell you. And I won't promise results before I've seen your data.",
                    ],
                },
                {
                    title: "Who it's for: SMEs and startups",
                    body: [
                        "<strong>SMEs</strong> with repetitive tasks or a lot of knowledge scattered across documents and email, and no technical team with time to evaluate the options.",
                        "<strong>Startups</strong> that want to add AI to their product and need to decide which model to use, how to connect it to their data, and what cost and risk they're taking on.",
                    ],
                },
                {
                    title: "AI strategy: from use cases to roadmap",
                    list: [
                        "Process assessment: where the time goes and what data is available.",
                        "Use cases ranked by impact, difficulty and risk.",
                        `Choice of tools and models: LLMs, RAG or agents, and when you need none of them. If your case involves RAG, <a href="${RAG}">this chunking guide</a> covers one of the decisions that most affects answer quality.`,
                        "Rollout roadmap: what comes first, what's needed and how to check it's working.",
                    ],
                    after: [
                        `Implementation is a separate engagement, as <a href="/en/services/ai-integration/">AI integration</a> or <a href="/en/services/ai-automation/">AI automation</a>.`,
                    ],
                },
                {
                    title: "AI and data protection (GDPR)",
                    body: [
                        `Sending data to a model is data processing like any other, so it's part of the assessment from day one: where data is hosted and processed, what can be removed before it's sent, and what each vendor does with it. I cover this in more depth on the <a href="${GDPR}">GDPR-compliant AI page</a>. This is technical guidance, not legal advice.`,
                    ],
                },
                {
                    title: "How I work",
                    steps: [
                        "<strong>Assessment.</strong> We go through your processes, your data and what you already use.",
                        "<strong>Proposal.</strong> I present the ranked use cases and the roadmap.",
                        "<strong>Implementation.</strong> If you decide to continue with me, it runs as a separate project.",
                        "<strong>Ongoing support.</strong> We review what's been rolled out and adjust the roadmap.",
                    ],
                    after: ["All the work is remote, for companies in Spain and the rest of Europe."],
                },
            ],
            faq: {
                title: "FAQ",
                items: [
                    { question: "How much does AI consulting cost?", answer: priceAnswer },
                    {
                        question: "Do I need my own data?",
                        answer: "It depends on the case. An assistant over your documentation needs that documentation, although it doesn't have to be perfect to start. Other tasks, such as summarising or classifying text, can start with a general-purpose model. We'll work that out in the assessment.",
                    },
                    {
                        question: "How long does it take?",
                        answer: "It depends on how many processes we review and how easy the information is to reach. You'll get a specific timeline in the proposal.",
                    },
                    {
                        question: "Do I need a technical team?",
                        answer: "No. If you don't have one, the roadmap takes that into account and I'll explain each decision without jargon. If you do, I work with them.",
                    },
                    {
                        question: "Do I have to hire you for the implementation?",
                        answer: "No. The roadmap is written so that your team or any other provider can carry it out.",
                    },
                ],
            },
            cta: "Book an AI assessment",
        },

        "ai-integration": {
            serviceName: "AI integration",
            title: "AI integration services: AI agents, LLM integration, RAG & custom chatbots",
            description:
                "AI integration for SMEs and startups: AI agent development, LLM integration into your apps, RAG over your documents and custom AI chatbots.",
            h1: "AI integration services: agents, LLMs, RAG and chatbots",
            intro: [
                "You can put together a demo with a model in an afternoon. The hard part comes next: getting it to use your data, connecting it to your systems, making it fail in a controlled way and being able to tell why it answered what it did. That's what this service is about.",
            ],
            sections: [
                {
                    title: "AI agent development",
                    body: [
                        "An agent is a model that can use tools as well as answer: query a database, call an API or create a record in your system. It suits multi-step tasks that someone does today by jumping between applications.",
                        "The key is to keep it bounded. I define what it can do, which actions need human confirmation and what gets logged, so the agent never makes decisions nobody can review.",
                    ],
                },
                {
                    title: "LLM integration into your product",
                    body: [
                        "Adding a language model to your application is more than one API call. It means handling errors and timeouts, keeping an eye on the cost per use, testing the quality of the answers and being able to switch model without rewriting everything.",
                    ],
                },
                {
                    title: "RAG development: answers grounded in your data",
                    body: [
                        "RAG connects a model to your documentation without retraining it: it retrieves the relevant passages and answers from them, so it can cite its source and stays current by simply reindexing a document.",
                        `Quality depends heavily on how documents are split, which is why I wrote a <a href="${RAG}">guide to chunking strategies</a>. Before choosing a model, I look at your document types and the cost and latency you can accept.`,
                    ],
                },
                {
                    title: "Custom AI chatbots",
                    body: [
                        "A template chatbot answers everything it's asked, whether it knows or not. A custom one answers from your information, says so when it doesn't have the answer and hands over to a person when it should. It can be used for customer service, internal support or inside your product.",
                    ],
                },
                {
                    title: ".NET and Azure integration",
                    body: [
                        "AI adds little if it lives in isolation. I connect it to what you already have through APIs, .NET applications and databases, with authentication, permissions and logging, like any other part of your software. My stack is .NET, Azure, Semantic Kernel and Go, along with model APIs and RAG.",
                        `<a href="/en/work/">My projects</a> show how I approach systems whose services talk asynchronously, such as the hotel booking one built with .NET Aspire and Azure Service Bus.`,
                    ],
                },
                {
                    title: "Privacy and GDPR",
                    body: [
                        `We decide together which data reaches the model, where it's processed and which vendor to use, looking for EU hosting and sending only what's essential. The <a href="${GDPR}">GDPR-compliant AI page</a> goes into more detail, and if you're not sure yet what to do, <a href="/en/services/ai-consulting/">AI consulting</a> is the place to start. This is technical guidance, not legal advice.`,
                    ],
                },
            ],
            faq: {
                title: "FAQ",
                items: [
                    { question: "How much does AI integration cost?", answer: priceAnswer },
                    {
                        question: "Which AI model is best?",
                        answer: "It depends on the task, the cost per use, the latency and where the data is processed. I try to keep the model replaceable without rebuilding the system, because this market moves fast.",
                    },
                    {
                        question: "Can it work with my existing application?",
                        answer: "Generally yes, if the application has an API or an accessible database. If it doesn't, we'll look at what needs adding first.",
                    },
                    {
                        question: "How do you stop it from making things up?",
                        answer: "You can't remove the risk completely, but you can reduce it a lot: restricting answers to your documents, showing the source, letting it say it doesn't know and testing it with real questions from your business.",
                    },
                ],
            },
            cta: "Discuss your integration",
        },

        "ai-automation": {
            serviceName: "AI automation",
            title: "AI automation for SMEs: business process automation with AI",
            description:
                "AI automation for SMEs and startups: automate repetitive work (email, documents, support, reporting) by connecting AI to the tools you already use.",
            h1: "AI automation for SMEs and startups",
            intro: [
                "Many repetitive tasks couldn't be automated because someone had to read a text and understand it. AI covers that part. My job is to connect it to the tools you already use so the process works end to end, with a person reviewing wherever it's needed.",
            ],
            sections: [
                {
                    title: "Which processes can be automated with AI",
                    list: [
                        "<strong>Email:</strong> sort what comes in, extract the data and prepare a draft reply.",
                        "<strong>Documents:</strong> read invoices, contracts or forms and move the data into your system.",
                        "<strong>Customer support:</strong> answer common questions from your information and pass on the rest.",
                        "<strong>Reporting:</strong> gather data from several sources and write a regular summary.",
                    ],
                    after: ["These are common examples, not a closed list. Good candidates tend to be frequent processes with fairly clear rules, where a mistake can be spotted and corrected."],
                },
                {
                    title: "How I do it: from a manual process to an automated one",
                    steps: [
                        "<strong>Assessment.</strong> We look at how the process runs today, with real examples and their exceptions.",
                        "<strong>Proposal.</strong> We decide what gets automated, what stays with a person and how it will be measured.",
                        "<strong>Implementation.</strong> I build it and test it on real cases before giving it autonomy.",
                        "<strong>Ongoing support.</strong> We review failures and adjust as needed.",
                    ],
                },
                {
                    title: "Tools and connecting to your software",
                    body: [
                        "I start with what you already use: your email, CRM, ERP or spreadsheets. If they have an API, connecting them is straightforward. If not, we look for another route or consider whether it's worth it. The build fits the case, from a simple integration to a dedicated service, and if the automation needs something more complex it becomes an <a href=\"/en/services/ai-integration/\">AI integration</a> project.",
                    ],
                },
                {
                    title: "When automation isn't worth it",
                    list: [
                        "When the process keeps changing or nobody can explain how it's done.",
                        "When it happens so rarely that automating it costs more than it saves.",
                        "When a mistake has serious consequences and nobody reviews the result.",
                        "When a simple rule solves it: then you don't need AI, and it's cheaper and more reliable.",
                    ],
                    after: ["If your case is one of these, I'll tell you before quoting anything."],
                },
            ],
            faq: {
                title: "FAQ",
                items: [
                    { question: "How much does AI automation cost?", answer: priceAnswer },
                    {
                        question: "What happens when the AI gets it wrong?",
                        answer: "It will get something wrong at some point, so the process is designed with that in mind: automatic checks, human review of the sensitive steps and a log of what it did so it can be corrected.",
                    },
                    {
                        question: "Do I have to change my tools?",
                        answer: "Usually not. The idea is to connect what you already use. I'd only suggest a change if a tool makes the work impossible, and I'd explain why.",
                    },
                    {
                        question: "Is it GDPR-compliant?",
                        answer: `It depends on the data involved and the vendors chosen. I take it into account in the design, looking to process in the EU and send only what's needed, though the legal assessment belongs to your adviser. There's more on the <a href="${GDPR}">GDPR-compliant AI page</a>.`,
                    },
                ],
            },
            cta: "Find what you can automate",
        },

        "technical-consulting": {
            serviceName: "Fractional CTO and technical consulting",
            title: "Fractional CTO & MVP development for startups | .NET consulting",
            description:
                "Fractional CTO for startups and SMEs: architecture, MVP development, .NET consulting and legacy application modernization. Remote across Europe.",
            h1: "Fractional CTO and technical consulting",
            intro: [
                "Some technical decisions shape a product for years, and they often get made with nobody experienced in the room. I help you make them well and build whatever is needed, remotely and with the level of commitment that makes sense for your company.",
            ],
            sections: [
                {
                    title: "Fractional CTO / CTO as a service",
                    body: [
                        "If you don't need a full-time CTO yet, I can take on that role part-time: choosing the stack, reviewing the architecture, setting technical priorities and helping you deal with vendors or hire your first developers.",
                    ],
                },
                {
                    title: "MVP development for startups",
                    body: [
                        `An MVP has to ship soon without closing doors later. I've written about both sides: <a href="/en/blog/the-fast-launch-stack-shipping-robust-apps-in-days-with-net-go-and-ai/">the stack I use to launch projects quickly</a> and <a href="/en/blog/zero-to-production-2026/">how to deploy them without hosting eating your budget</a>. That's how I build and maintain <a href="${TEMPOO}">Tempoo Analytics</a>, a product I run on my own.`,
                    ],
                },
                {
                    title: ".NET consulting",
                    body: [
                        `.NET is where I have the most experience, along with Azure: from <a href="/en/work/blazorsignalstore/">BlazorSignalStore</a>, a state management library for Blazor, to <a href="/en/work/booking/">booking</a>, a microservices system on .NET Aspire. I can help you with design decisions, performance or a specific problem your team is stuck on.`,
                    ],
                },
                {
                    title: "Legacy application modernization",
                    body: [
                        "If you have an old .NET application that's hard to maintain, migrating doesn't have to be a leap in the dark. We first look at which parts cause the most trouble, then move them in stages to current versions of .NET, with the application running throughout.",
                    ],
                },
                {
                    title: "Architecture reviews",
                    body: [
                        `I review your system or design and tell you what I'd change, what I'd leave alone and why. I've written about <a href="/en/blog/vertical-slice-architecture/">vertical slice architecture</a> and <a href="/en/blog/event-driven-architecture/">event-driven architecture</a>, but I don't apply a default pattern: the architecture has to fit the size of your team and your product.`,
                    ],
                },
            ],
            faq: {
                title: "FAQ",
                items: [
                    { question: "How much does a fractional CTO cost?", answer: priceAnswer },
                    {
                        question: "What's the difference between a fractional CTO and a consultant?",
                        answer: "A consultant solves a specific question or project. A fractional CTO takes on technical responsibility on an ongoing, part-time basis.",
                    },
                    {
                        question: "Do you only work with .NET?",
                        answer: `It's where I have the most experience, along with Azure, but I also use Go: the ingestion service in <a href="${TEMPOO}">Tempoo Analytics</a> is written in Go. If your stack is something else, I'll tell you honestly whether I'm the right person.`,
                    },
                    {
                        question: "Do you also build, or only advise?",
                        answer: "Both. I can stick to reviewing and deciding with you, or build the product or the part you need.",
                    },
                ],
            },
            cta: "Book a technical session",
        },

        "gdpr-compliant-ai": {
            serviceName: "GDPR-compliant AI",
            title: "GDPR-compliant AI: build and integrate AI with EU data protection in mind",
            description:
                "Integrate AI without GDPR headaches: EU data residency, data minimisation, vendor choice and DPAs. AI consulting for European SMEs and startups.",
            h1: "GDPR-compliant AI for European companies",
            intro: [
                "Plenty of AI projects stall when someone asks where the data goes. It's better to answer that at the start, while the design can still change, than to find out once the system is in production.",
            ],
            notice: "This is technical guidance, not legal advice.",
            sections: [
                {
                    title: "What makes an AI system GDPR-compliant",
                    body: [
                        "No model is GDPR-compliant on its own. What gets assessed is the whole data processing: which personal data goes in, for what purpose and on what legal basis, who processes it, where, for how long, and how people can exercise their rights. That's why it's a matter of system design, not of choosing a product with the right label.",
                    ],
                },
                {
                    title: "EU hosting and data residency",
                    body: [
                        "Hosting in the EU avoids a large part of the international transfer questions, but it's worth checking what the setting really covers: where the application is hosted, where the model runs, and where logs, embeddings and backups end up. A vector index built from personal data can still contain personal data.",
                    ],
                },
                {
                    title: "Choosing AI vendors and models",
                    list: [
                        "<strong>Data processing agreement (DPA):</strong> whether the vendor offers one and what it covers.",
                        "<strong>Use of your data:</strong> whether it's used for training, and how long it's retained.",
                        "<strong>Processing location:</strong> which regions are available and which sub-processors are involved.",
                        "<strong>Data minimisation:</strong> what you can remove or anonymise before anything is sent.",
                    ],
                    after: ["Terms vary by vendor and by plan and they change over time, so they should be checked against the current contract rather than assumed."],
                },
                {
                    title: "Practical example: privacy-first analytics (Tempoo Analytics)",
                    body: [
                        `It isn't an AI product, but the design criteria carry over. <a href="${TEMPOO}">Tempoo Analytics</a>, the web analytics tool I develop, doesn't use cookies or store full IP addresses, counts unique visitors with a hash that changes every month and runs on servers in the European Union. On this site the script only loads with consent, because the identifiers it keeps in the browser fall into a grey area of the ePrivacy rules and I chose the cautious option.`,
                    ],
                },
                {
                    title: "How I can help",
                    list: [
                        `Review the data flows of an AI system you have or are planning, as part of <a href="/en/services/ai-consulting/">AI consulting</a>.`,
                        `Design and build it with these criteria from the start, through <a href="/en/services/ai-integration/">AI integration</a>.`,
                        "Prepare the technical information your legal adviser or data protection officer needs in order to assess it.",
                    ],
                    after: ["I don't issue compliance certificates: my part is the technical work."],
                },
            ],
            faq: {
                title: "FAQ",
                items: [
                    {
                        question: "Can I use ChatGPT or similar tools in my company under the GDPR?",
                        answer: "It depends on the plan, the contract and what data people put into it. Most of the risk lies in staff pasting personal data into tools with no agreement in place, so it's worth setting rules as well as choosing a tool.",
                    },
                    {
                        question: "Does the data have to stay in the EU?",
                        answer: "The GDPR doesn't always require it, as there are mechanisms for international transfers. Keeping it in the EU simply makes things easier, and it's what I look for first. Your legal adviser should assess each case.",
                    },
                    {
                        question: "Do I need to self-host the model?",
                        answer: "Not necessarily. It's an option when the data is very sensitive, but it adds cost and operational work. Often an EU-hosted service with a suitable contract is enough.",
                    },
                    { question: "How much does it cost?", answer: priceAnswer },
                ],
            },
            cta: "Talk about privacy-first AI",
        },
    },
};
