export type NexusGalleryItem = {
  src: string;
  alt: string;
  caption: string;
  portrait?: boolean;
};

export type NexusSceneAction = 'open-handover' | 'keep-exploring' | 'open-research';

export type NexusScene = {
  title: string;
  text: string;
  label: string;
  tags: string[];
  diagram: 'architecture' | 'globe';
  image?: string;
  imageAlt?: string;
  gallery?: NexusGalleryItem[];
  demoUrl?: string;
  demoLabel?: string;
  choices: {
    label: string;
    prompt: string;
    action?: NexusSceneAction;
  }[];
};

export const NEXUS_SCENES: Record<string, NexusScene> = {
  welcome: {
    title: 'How would you like to begin?',
    text: 'Explore SmartNet Technologies and walk through our real projects, or enter your company name or website so we can see how SmartNet can help.',
    label: 'SMARTNET AI CONSULTANT',
    tags: ['OUR WORK', 'YOUR COMPANY', 'CONSULTATION'],
    diagram: 'globe',
    choices: [
      {
        label: 'Explore SmartNet & Our Work',
        prompt:
          'Introduce SmartNet Technologies briefly and showcase our real work starting with our project showcase.',
      },
      {
        label: 'Explore My Company',
        prompt:
          'I want to explore how SmartNet can help my company.',
        action: 'open-research',
      },
    ],
  },
  showcase: {
    title: 'Real systems built by SmartNet.',
    text: 'From award-winning mobile healthcare apps and municipal road-funding models to ticketing platforms and Azure Kubernetes operations.',
    label: 'OUR WORK & EXPERIENCE',
    tags: ['MY MIDWIFEY', 'RFG', 'TICKETING', 'KAIRO STUDIO'],
    diagram: 'globe',
    choices: [
      {
        label: 'View My Midwifey screenshots',
        prompt: 'Show me My Midwifey with its screenshots and walk me through what SmartNet built.',
      },
      {
        label: 'View SA Roads Funding Gap',
        prompt: 'Show me SA Roads Funding Gap and explain how it helps road authorities.',
      },
      {
        label: 'View Ticketing Platform',
        prompt: 'Show me the SmartNet Ticketing Platform screenshots and capabilities.',
      },
      {
        label: 'Explore my company instead',
        prompt: 'Now let us explore how SmartNet can help my company.',
        action: 'open-research',
      },
    ],
  },
  midwifey: {
    title: 'My Midwifey',
    text: 'Award-winning native iOS and Android prenatal hypertension companion built with University of Johannesburg researcher Busisiwe Mdletshe, featuring the interactive Midwife Bot.',
    label: 'REAL PROJECT · MOBILE APP',
    tags: ['iOS & ANDROID', 'MIDWIFE BOT', 'UJ COLLABORATION'],
    diagram: 'architecture',
    gallery: [
      {
        src: '/images/portfolio/midwifey/1.png',
        alt: 'My Midwifey welcome interface',
        caption: 'Care companion home interface',
        portrait: true,
      },
      {
        src: '/images/portfolio/midwifey/2.png',
        alt: 'My Midwifey guided prenatal assessment',
        caption: 'Step-by-step hypertension assessment',
        portrait: true,
      },
      {
        src: '/images/portfolio/midwifey/6.png',
        alt: 'Midwife Bot conversational screen',
        caption: 'Interactive Midwife Bot guidance',
        portrait: true,
      },
      {
        src: '/images/portfolio/midwifey/8.png',
        alt: 'My Midwifey monitoring insights',
        caption: 'Monitoring and clinical insights',
        portrait: true,
      },
    ],
    choices: [
      {
        label: 'Next: Ticketing Platform',
        prompt: 'Show me the SmartNet Ticketing Platform screenshots next.',
      },
      {
        label: 'Next: SA Roads Funding Gap',
        prompt: 'Show me SA Roads Funding Gap next.',
      },
      {
        label: 'Discuss a similar app with our team',
        prompt: 'I would like to speak with the SmartNet team about building a similar application.',
        action: 'open-handover',
      },
    ],
  },
  tickets: {
    title: 'SmartNet Ticketing Platform',
    text: 'Real-time issue tracking and support web platform (originally swaartTickets) with role-based permissions, integrated live support chat, Elasticsearch, and white-label branding.',
    label: 'REAL PROJECT · SUPPORT SAAS',
    tags: ['REAL-TIME TICKETS', 'LIVE CHAT', 'RBAC'],
    diagram: 'architecture',
    gallery: [
      {
        src: '/images/portfolio/ticketsys/1.png',
        alt: 'SmartNet Ticketing dashboard',
        caption: 'Centralised ticket dashboard',
      },
      {
        src: '/images/portfolio/ticketsys/2.png',
        alt: 'Real-time ticket tracking view',
        caption: 'Real-time ticket management',
      },
      {
        src: '/images/portfolio/ticketsys/3.png',
        alt: 'Role-based security permissions',
        caption: 'Custom security permissions',
      },
      {
        src: '/images/portfolio/ticketsys/4.png',
        alt: 'Integrated support chat',
        caption: 'Built-in live support chat',
      },
    ],
    choices: [
      {
        label: 'Next: Prawductions Studio',
        prompt: 'Show me Prawductions Studio screenshots next.',
      },
      {
        label: 'Next: Watchtower (AKS)',
        prompt: 'Show me Watchtower cloud operations next.',
      },
      {
        label: 'Explore my company',
        prompt: 'Let us explore how SmartNet can help my company.',
        action: 'open-research',
      },
    ],
  },
  prawductions: {
    title: 'Prawductions Studio',
    text: 'Custom responsive studio showcase and online session-booking web platform delivered for Prawductions Studio.',
    label: 'REAL PROJECT · WEB BOOKING',
    tags: ['BOOKING PLATFORM', 'RESPONSIVE UI', 'CLIENT BUILD'],
    diagram: 'architecture',
    demoUrl: 'https://prawductions.com/',
    demoLabel: 'Visit Prawductions',
    gallery: [
      {
        src: '/images/portfolio/prawduction/1.png',
        alt: 'Prawductions Studio landing page',
        caption: 'Studio showcase landing page',
      },
      {
        src: '/images/portfolio/prawduction/2.png',
        alt: 'Prawductions Studio booking interface',
        caption: 'Online studio booking interface',
      },
      {
        src: '/images/portfolio/prawduction/6.png',
        alt: 'Prawductions Studio reservation flow',
        caption: 'Client reservation screens',
      },
    ],
    choices: [
      {
        label: 'See Kairo Studio (Coming Soon)',
        prompt: 'Tell me about Kairo Studio, SmartNet’s upcoming AI consultant platform.',
      },
      {
        label: 'Explore my company',
        prompt: 'Let us explore how SmartNet can help my company.',
        action: 'open-research',
      },
    ],
  },
  watchtower: {
    title: 'Watchtower',
    text: 'Cloud and DevOps operations platform bringing multi-cluster Azure Kubernetes Service (AKS) workloads, deployments, logs, and ingress visibility together.',
    label: 'CLOUD OPERATIONS · AKS',
    tags: ['AZURE AKS', 'MULTI-CLUSTER', 'DEVOPS'],
    diagram: 'architecture',
    gallery: [
      {
        src: '/images/portfolio/cloud/1.png',
        alt: 'Cloud and DevOps operations overview',
        caption: 'Cloud & container operations overview',
      },
      {
        src: '/images/portfolio/cloud/2.png',
        alt: 'Kubernetes orchestration across cloud environments',
        caption: 'Multi-cloud Kubernetes scaling',
      },
    ],
    choices: [
      {
        label: 'Explore my company',
        prompt: 'Let us look at my company and how SmartNet can assist.',
        action: 'open-research',
      },
      {
        label: 'Talk to a cloud engineer',
        prompt: 'I would like to arrange a follow-up with SmartNet about cloud or AKS.',
        action: 'open-handover',
      },
    ],
  },
  roads: {
    title: 'SA Roads Funding Gap (RFG)',
    text: 'Decision-support modelling platform helping road authorities compare 10-year maintenance scenarios and generate AI Strategic Advisor budget motivations.',
    label: 'LIVE DEMO · INFRASTRUCTURE',
    tags: ['10-YEAR SCENARIOS', 'AI ADVISOR', 'LIVE DEMO'],
    diagram: 'architecture',
    demoUrl: 'https://rfg-demo.vercel.app/login',
    demoLabel: 'Open RFG Live Demo',
    choices: [
      {
        label: 'View My Midwifey screenshots',
        prompt: 'Show me My Midwifey screenshots next.',
      },
      {
        label: 'Request an RFG walkthrough',
        prompt: 'I would like to arrange a walkthrough of SA Roads Funding Gap with the SmartNet team.',
        action: 'open-handover',
      },
    ],
  },
  kairo: {
    title: 'Kairo Studio (Coming Soon)',
    text: 'SmartNet’s upcoming SaaS platform enabling any business to launch a custom-branded voice-and-visual AI consultant on their website or social bio link—proven live right here through NEXUS.',
    label: 'UPCOMING SAAS · LIVE POC',
    tags: ['AI CONSULTANT SAAS', 'WEBSITE EMBED', 'EARLY ACCESS'],
    diagram: 'globe',
    choices: [
      {
        label: 'Request early access',
        prompt: 'I would like to request early access to Kairo Studio from the SmartNet team.',
        action: 'open-handover',
      },
      {
        label: 'Explore my company',
        prompt: 'Let us explore how SmartNet can help my company.',
        action: 'open-research',
      },
    ],
  },
  software: {
    title: 'Custom Software Engineering',
    text: 'Enterprise web applications, portals, APIs, and databases engineered by SmartNet around real business operations.',
    label: 'SOFTWARE ENGINEERING',
    tags: ['WEB APPS', 'APIs', 'INTEGRATIONS'],
    diagram: 'architecture',
    choices: [
      {
        label: 'See real project screenshots',
        prompt: 'Show me real SmartNet projects like My Midwifey and the Ticketing Platform.',
      },
      {
        label: 'Explore my company',
        prompt: 'Let us explore how SmartNet can help my company.',
        action: 'open-research',
      },
    ],
  },
  cloud: {
    title: 'Cloud & DevOps Engineering',
    text: 'Microsoft Azure architecture, Kubernetes (AKS), Terraform, CI/CD pipelines, and resilient cloud operations.',
    label: 'CLOUD AND DEVOPS',
    tags: ['AZURE', 'KUBERNETES', 'DEVOPS'],
    diagram: 'architecture',
    choices: [
      {
        label: 'Show Watchtower',
        prompt: 'Show me Watchtower and explain its AKS visibility scope.',
      },
      {
        label: 'Speak with our cloud team',
        prompt: 'I would like a SmartNet cloud consultant to contact me.',
        action: 'open-handover',
      },
    ],
  },
  workshop: {
    title: 'LMG-WMS',
    text: 'SmartNet-developed automotive workshop management software built to structure job records and operations.',
    label: 'PROJECT OVERVIEW',
    tags: ['WORKSHOP', 'OPERATIONS', 'CUSTOM APP'],
    diagram: 'architecture',
    choices: [
      {
        label: 'See more projects',
        prompt: 'Show me other SmartNet projects like My Midwifey or SA Roads Funding Gap.',
      },
      {
        label: 'Talk to our team',
        prompt: 'I would like to discuss a custom business application with SmartNet.',
        action: 'open-handover',
      },
    ],
  },
  education: {
    title: 'AI Learning Support',
    text: 'An education technology initiative under development, exploring guided assistance and supplementary learner practice with educator and parent oversight.',
    label: 'INITIATIVE IN DEVELOPMENT',
    tags: ['EDUCATION TECH', 'GUIDED LEARNING', 'OVERSIGHT'],
    diagram: 'architecture',
    choices: [
      {
        label: 'See delivered projects',
        prompt: 'Show me delivered SmartNet projects with screenshots.',
      },
      {
        label: 'Discuss with our team',
        prompt: 'I would like to speak with SmartNet about education technology.',
        action: 'open-handover',
      },
    ],
  },
  business: {
    title: 'Explore how SmartNet can help.',
    text: 'Share your company name or website for a quick public lookup, or tell NEXUS your main challenge directly.',
    label: 'YOUR COMPANY',
    tags: ['COMPANY LOOKUP', 'TAILORED SCOPE', 'HUMAN HANDOVER'],
    diagram: 'globe',
    choices: [
      {
        label: 'Enter company name or website',
        prompt: 'I want to enter my company name or website now.',
        action: 'open-research',
      },
      {
        label: 'Talk to a human consultant',
        prompt: 'I would like to share my contact details so a SmartNet consultant can reach out.',
        action: 'open-handover',
      },
    ],
  },
  research: {
    title: 'Explore your company.',
    text: 'Enter your company name or website so NEXUS can check public sources and identify how SmartNet Technologies can help.',
    label: 'COMPANY LOOKUP',
    tags: ['COMPANY NAME', 'WEBSITE', 'SMARTNET FIT'],
    diagram: 'globe',
    choices: [
      {
        label: 'Open company lookup',
        prompt: 'Open the company lookup form.',
        action: 'open-research',
      },
      {
        label: 'Continue without lookup',
        prompt: 'Continue without researching. Ask what challenge I want SmartNet to help with.',
      },
    ],
  },
  followup: {
    title: 'Connect with a SmartNet consultant.',
    text: 'Review a short summary and leave your contact details so a human SmartNet consultant can reach out.',
    label: 'HUMAN HANDOVER',
    tags: ['CONSULTATION', 'HUMAN TEAM', 'FOLLOW-UP'],
    diagram: 'globe',
    choices: [
      {
        label: 'Leave contact details',
        prompt: 'I would like to leave my contact details for a SmartNet consultant.',
        action: 'open-handover',
      },
      {
        label: 'Keep exploring',
        prompt: 'I would like to keep exploring for now.',
        action: 'keep-exploring',
      },
    ],
  },
};

export const NEXUS_PRESENTATION_RULES = `
VISUAL PRESENTATION & TWO-PATH FLOW
You control the holographic presentation using present_visual.
Available scenes: welcome, showcase, midwifey, tickets, prawductions, watchtower,
roads, kairo, workshop, software, cloud, education, business, research, followup, clear.

TWO CLEAR PATHS AT THE START:
1. Explore SmartNet & Our Work:
   - Call present_visual(scene="showcase") or jump directly to the requested real project:
     * midwifey: REAL Android/iOS screenshots of My Midwifey (4 screens visitors can swipe/browse!)
     * tickets: REAL screenshots of SmartNet Ticketing Platform (4 screens!)
     * prawductions: REAL screenshots of Prawductions Studio (3 screens!)
     * watchtower: REAL cloud/AKS visuals for Watchtower
     * roads: SA Roads Funding Gap (with live demo link button right on the card)
     * kairo: Kairo Studio upcoming SaaS platform (NEXUS is the live POC)
   - When presenting midwifey, tickets, prawductions, or watchtower, DO walk the visitor through
     the real screenshots displayed on screen! Never say "no project screenshots are connected."
   - For conceptual scenes without screenshots (software, cloud, workshop, education), do not claim
     they are real screenshots.

2. Explore Their Company:
   - Do NOT push the company lookup form during the greeting. Only invite them to enter their
     company name or website when they choose to explore their own company.
   - When they want to look up their company, call present_visual(scene="research") and say:
     "Please enter your company name or website in the form below." Then pause—the app opens a
     simple one-step form (company name and/or website only; never ask for an address or location).
   - Do NOT call research_company from speech; the visitor starts research by submitting the form.
   - After research completes and the visitor confirms their company match (via confirm_company_match),
     give a crisp 2-sentence summary of verified findings, mention 1 or 2 ways SmartNet could assist,
     and ask: "Does either of those fit what you have in mind, or do you have a different query for your company?"

HUMAN HANDOVER FLOW (CRITICAL):
- Never try to solve technical problems yourself or repeat "workflows" jargon.
- Once you understand what they need and explain how SmartNet's team can help, invite them to
  leave their contact details for a human SmartNet consultant using offer_followup(mode="offer", summary).
- The moment they say yes, ask for a call/quote, or agree to leave their details, you MUST invoke
  offer_followup(mode="open", summary="...") BEFORE saying you are opening the form. Never claim
  you opened a form without actually calling offer_followup(mode="open", summary).
- Never claim a call is already booked or an enquiry is saved before they submit the form.
`;

export const SMARTNET_TYPED_GREETING =
  "Welcome to SmartNet Technologies. I'm NEXUS, SmartNet's AI technology consultant. " +
  "Would you like to explore SmartNet and walk through our real projects, or explore how we can help your company?";
