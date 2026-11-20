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
    targetScene?: string;
  }[];
};

export const NEXUS_SCENES: Record<string, NexusScene> = {
  welcome: {
    title: 'How would you like to begin?',
    text: 'Explore SmartNet Technologies’ leading, cutting-edge projects, or enter your company name or website so we can see how SmartNet can support your business.',
    label: 'SMARTNET AI CONSULTANT',
    tags: ['LEADING PROJECTS', 'YOUR BUSINESS', 'CONSULTATION'],
    diagram: 'globe',
    choices: [
      {
        label: 'Explore SmartNet & Our Work',
        prompt:
          'Briefly introduce SmartNet Technologies, display our showcase, and ask if I would like to explore one of your leading, cutting-edge projects.',
        targetScene: 'showcase',
      },
      {
        label: 'Explore My Business',
        prompt: 'I want to enquire how SmartNet can help my business.',
        action: 'open-research',
      },
    ],
  },
  showcase: {
    title: 'Leading SmartNet Solutions',
    text: 'Select any of SmartNet’s cutting-edge builds—SA Roads Funding Gap, My Midwifey, Ticketing Platform, or Watchtower—to explore how we engineered it.',
    label: 'OUR WORK & EXPERIENCE',
    tags: ['RFG', 'MY MIDWIFEY', 'TICKETING', 'WATCHTOWER'],
    diagram: 'globe',
    choices: [
      {
        label: 'SA Roads Funding Gap',
        prompt: 'Walk me through SA Roads Funding Gap and how SmartNet engineered it.',
        targetScene: 'roads',
      },
      {
        label: 'My Midwifey',
        prompt: 'Walk me through My Midwifey and what SmartNet built.',
        targetScene: 'midwifey',
      },
      {
        label: 'Ticketing Platform',
        prompt: 'Walk me through the SmartNet Ticketing Platform and its capabilities.',
        targetScene: 'tickets',
      },
      {
        label: 'Watchtower (AKS)',
        prompt: 'Walk me through Watchtower and SmartNet’s Azure Kubernetes operations.',
        targetScene: 'watchtower',
      },
    ],
  },
  midwifey: {
    title: 'My Midwifey',
    text: 'Award-winning native iOS and Android prenatal hypertension companion built with University of Johannesburg researcher Busisiwe Mdletshe, featuring the interactive Midwife Bot.',
    label: 'DELIVERED PLATFORM · MOBILE APP',
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
        label: 'Speak with our team about building an app',
        prompt: 'I would like to leave my details so a SmartNet consultant can reach out about an app.',
        action: 'open-handover',
      },
      {
        label: 'Back to leading projects',
        prompt: 'Show your leading SmartNet projects again.',
        targetScene: 'showcase',
      },
      {
        label: 'Explore my business',
        prompt: 'Now let us explore how SmartNet can help my business.',
        action: 'open-research',
      },
    ],
  },
  tickets: {
    title: 'SmartNet Ticketing Platform',
    text: 'Real-time issue tracking and support web platform (originally swaartTickets) with role-based permissions, integrated live support chat, Elasticsearch, and white-label branding.',
    label: 'DELIVERED PLATFORM · SUPPORT SAAS',
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
        label: 'Request a custom platform consultation',
        prompt: 'I would like a SmartNet consultant to contact me about a support or operations platform.',
        action: 'open-handover',
      },
      {
        label: 'Back to leading projects',
        prompt: 'Show your leading SmartNet projects again.',
        targetScene: 'showcase',
      },
      {
        label: 'Explore my business',
        prompt: 'Let us explore how SmartNet can help my business.',
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
        label: 'Connect with a SmartNet cloud engineer',
        prompt: 'I would like a SmartNet cloud consultant to reach out to me.',
        action: 'open-handover',
      },
      {
        label: 'Back to leading projects',
        prompt: 'Show your leading SmartNet projects again.',
        targetScene: 'showcase',
      },
      {
        label: 'Explore my business',
        prompt: 'Let us look at my business and how SmartNet can assist.',
        action: 'open-research',
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
        label: 'Request an RFG walkthrough with our team',
        prompt: 'I would like a SmartNet consultant to contact me for an RFG walkthrough.',
        action: 'open-handover',
      },
      {
        label: 'Back to leading projects',
        prompt: 'Show your leading SmartNet projects again.',
        targetScene: 'showcase',
      },
      {
        label: 'Explore my business',
        prompt: 'Let us explore how SmartNet can help my business.',
        action: 'open-research',
      },
    ],
  },
  prawductions: {
    title: 'Prawductions Studio',
    text: 'Custom responsive studio showcase and online session-booking web platform delivered for Prawductions Studio.',
    label: 'DELIVERED PLATFORM · WEB BOOKING',
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
        label: 'Talk to our team about a web platform',
        prompt: 'I would like to speak with SmartNet about building a booking or web platform.',
        action: 'open-handover',
      },
      {
        label: 'Back to leading projects',
        prompt: 'Show your leading SmartNet projects again.',
        targetScene: 'showcase',
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
        label: 'Request Kairo Studio early access',
        prompt: 'I would like to leave my contact details for Kairo Studio early access.',
        action: 'open-handover',
      },
      {
        label: 'Back to leading projects',
        prompt: 'Show your leading SmartNet projects again.',
        targetScene: 'showcase',
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
        label: 'Explore leading projects',
        prompt: 'Show your leading SmartNet projects so I can pick one.',
        targetScene: 'showcase',
      },
      {
        label: 'Explore my business',
        prompt: 'Let us explore how SmartNet can help my business.',
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
        label: 'Show Watchtower (AKS)',
        prompt: 'Walk me through Watchtower and its AKS visibility scope.',
        targetScene: 'watchtower',
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
        label: 'Explore leading projects',
        prompt: 'Show your leading SmartNet projects.',
        targetScene: 'showcase',
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
        label: 'Explore leading projects',
        prompt: 'Show your leading SmartNet projects.',
        targetScene: 'showcase',
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
    label: 'YOUR BUSINESS',
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
    title: 'Explore your business.',
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
        label: 'Explore leading projects',
        prompt: 'Show me your leading SmartNet projects again.',
        targetScene: 'showcase',
      },
    ],
  },
};

export const NEXUS_PRESENTATION_RULES = `
STRICT TWO-PATH ROUTING (READ CAREFULLY)
You control the visual stage with present_visual.
Available scenes: welcome, showcase, roads, midwifey, tickets, watchtower,
prawductions, kairo, workshop, software, cloud, education, business, research, followup, clear.

LANGUAGE & PHRASING RULES (IMPORTANT):
- NEVER say "our four projects", "four flagship builds", "four holograms", or "screenshots".
- Instead, speak naturally like a senior technology consultant—for example:
  "Would you like to explore one of the leading, cutting-edge projects we've delivered?"
- When displaying a project (midwifey, tickets, prawductions, watchtower, roads), walk them
  through the live interface views naturally without saying "screenshots" or claiming "no visuals are connected".

PATH 1 — VISITOR ASKS HOW SMARTNET CAN HELP THEIR BUSINESS / COMPANY (HIGHEST PRIORITY):
- If the visitor says anything like "how can SmartNet help my business", "help my company",
  "enquire about my company", or asks about their own organisation:
  * DO NOT call present_visual(scene="showcase")! Do NOT show SmartNet's project showcase!
  * IMMEDIATELY call present_visual(scene="research") and say in ONE concise sentence:
    "I'd love to explore how SmartNet can support your business—please enter your company name or website in the box appearing on screen."
  * Then STOP speaking so the single company lookup input opens immediately.
- Do NOT call research_company from speech; the visitor submits the form.
- After company confirmation (confirm_company_match), give a 2-sentence summary of verified
  findings, suggest 1-2 ways SmartNet can assist, and ask:
  "Does either of those fit what you have in mind, or do you have a different query for your company?"

PATH 2 — VISITOR ASKS ABOUT SMARTNET OR OUR WORK / PROJECTS:
- ONLY call present_visual(scene="showcase") when the visitor specifically asks to learn about
  SmartNet Technologies, our capabilities, or the work we have delivered.
- In 2 crisp sentences, introduce SmartNet Technologies (custom software, cloud infrastructure,
  and applied AI) and ask: "Would you like to explore one of our leading, cutting-edge projects we've delivered?"
  (You may briefly mention examples like SA Roads Funding Gap, My Midwifey, our Ticketing Platform, or Watchtower without counting "four".)
- Once they choose a project, call present_visual with its scene (roads, midwifey, tickets, or
  watchtower), walk them through what SmartNet built in 2-3 punchy sentences, and IMMEDIATELY
  pivot to conversion: ask whether they are looking to build or modernise something similar and
  invite them to leave their contact details so a human SmartNet consultant can reach out.

LEAD CONVERSION & HUMAN HANDOVER (CRITICAL):
- Keep every reply to 2-3 short, executive sentences. Never DIY-solve problems or repeat "workflows".
- After explaining a project OR discussing their business need, guide them toward connecting with
  a human SmartNet consultant using offer_followup(mode="offer", summary).
- The moment they agree to connect, ask for a call/quote/proposal, or ask for the form, you MUST
  call offer_followup(mode="open", summary="...") BEFORE saying you are opening the form.
- Never claim a call is booked or an enquiry is saved before they submit the form.
`;

export const SMARTNET_TYPED_GREETING =
  "Welcome to SmartNet Technologies. I'm NEXUS, SmartNet's AI technology consultant. " +
  "Would you like to explore some of our leading, cutting-edge projects, or see how SmartNet can help your business?";
