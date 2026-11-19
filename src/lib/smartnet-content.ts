export const SERVICES = [
  {
    title: 'Software Engineering',
    subtitle: 'Systems built for real operations',
    description:
      'Custom applications, role-based portals, API integrations, databases, workflow automation and reporting.',
    capabilities: [
      'Full-stack applications',
      'APIs and integration',
      'Business process automation',
      'Data engineering',
    ],
  },
  {
    title: 'Cloud & Infrastructure',
    subtitle: 'Infrastructure you can operate',
    description:
      'Cloud architecture, Azure environments, networking, containers, migration and infrastructure as code.',
    capabilities: [
      'Microsoft Azure',
      'Kubernetes and AKS',
      'Terraform infrastructure',
      'Migration and resilience',
    ],
  },
  {
    title: 'DevOps & Operations',
    subtitle: 'Reliable delivery at scale',
    description:
      'CI/CD, GitOps, Argo CD, release engineering, monitoring and operational handover.',
    capabilities: [
      'CI/CD pipelines',
      'GitOps deployment',
      'Observability',
      'Operational runbooks',
    ],
  },
  {
    title: 'Architecture & Advisory',
    subtitle: 'Engineering direction that matters',
    description:
      'Solutions architecture, technical strategy, digital transformation and independent vendor-delivery assessments.',
    capabilities: [
      'Technology roadmaps',
      'Systems architecture',
      'Independent software reviews',
      'Digital transformation',
    ],
  },
  {
    title: 'Security & Resilience',
    subtitle: 'Protection designed in',
    description:
      'Secure development practices, infrastructure reviews, disaster recovery planning and operational governance.',
    capabilities: [
      'Secure development',
      'Access and secrets management',
      'Disaster recovery planning',
      'Technical assurance',
    ],
  },
  {
    title: 'Responsible AI & Education',
    subtitle: 'Intelligence with accountability',
    description:
      'Responsible AI integration, engineering productivity and educational software initiatives with human oversight.',
    capabilities: [
      'AI-assisted workflows',
      'Learning technology',
      'Human-led validation',
      'AI implementation advisory',
    ],
  },
  {
    title: 'Business Technology Solutions',
    subtitle: 'Beyond software delivery',
    description:
      'Technology consulting, procurement support, platform sourcing and connected business solutions within an agreed scope.',
    capabilities: [
      'Business technology consulting',
      'Technology sourcing',
      'Systems integration',
      'Project-based delivery',
    ],
  },
] as const;

export type SolutionGalleryItem = {
  src: string;
  alt: string;
  caption: string;
  portrait?: boolean;
};

export type SolutionItem = {
  slug: string;
  code: string;
  category: string;
  name: string;
  shortName: string;
  status: string;
  tagline: string;
  description: string;
  overview: string[];
  capabilities: string[];
  highlights: { title: string; detail: string }[];
  stack: string[];
  note: string;
  demoUrl?: string;
  demoLabel?: string;
  coverImage?: string;
  gallery?: SolutionGalleryItem[];
  legacyBrand?: boolean;
  isComingSoon?: boolean;
  featured?: boolean;
};

export const SOLUTIONS: SolutionItem[] = [
  {
    slug: 'road-funding-gap',
    code: '01 / PUBLIC INFRASTRUCTURE',
    category: 'Decision Support & Financial Modelling',
    name: 'SA Roads Funding Gap (RFG)',
    shortName: 'RFG',
    status: 'Live Demo Available',
    tagline: 'Bridge the gap between Engineering & Finance Decisioning.',
    description:
      'A modelling platform designed to help road authorities justify road maintenance budgets using consistent condition and cost simulation, 10-year scenario modelling, and AI-assisted strategic motivation narratives.',
    overview: [
      'Road authorities routinely face the challenge of translating technical road-condition surveys into clear financial motivations for budget committees. SA Roads Funding Gap Solutions bridges engineering reality and finance decisioning in one workspace.',
      'Users can model how different maintenance funding levels affect network condition over a 10-year horizon, quantify the long-term financial exposure of deferred maintenance, and generate decision-maker-ready risk and budget narratives.',
    ],
    capabilities: [
      '10-year network condition & budget scenario modelling',
      'AI Strategic Advisor for decision-maker risk narratives',
      'Deferred-maintenance financial exposure analysis',
      'Consistent road-condition and cost simulation',
    ],
    highlights: [
      {
        title: 'Scenario Modelling',
        detail:
          'Visualise the impact of budget choices on road network condition and backlog over a 10-year planning horizon.',
      },
      {
        title: 'AI Strategic Advisor',
        detail:
          'Generate structured, decision-maker-ready funding motivations and risk narratives grounded in scenario outputs.',
      },
      {
        title: 'Secure Workspace Gateway',
        detail:
          'Role-gated workspace architecture built for repeatable budget cycles and auditable planning assumptions.',
      },
    ],
    stack: ['Next.js', 'TypeScript', 'Scenario Simulation', 'Applied AI', 'Cloud'],
    note: 'Scenario estimates depend on the quality of input data and engineering assumptions. They support budget motivation and do not substitute for independently certified engineering cost estimates where required.',
    demoUrl: 'https://rfg-demo.vercel.app/login',
    demoLabel: 'Open RFG Live Demo',
    featured: true,
  },
  {
    slug: 'kairo-studio',
    code: '02 / SMARTNET SAAS — COMING SOON',
    category: 'AI Consultant SaaS Platform',
    name: 'Kairo Studio',
    shortName: 'KAIRO',
    status: 'Coming Soon · Live POC Active',
    tagline: 'SmartNet Presents: Your Interactive AI Consultant for Websites & Bio Links.',
    description:
      'An upcoming multi-tenant SaaS platform by SmartNet Technologies that lets any business launch a custom-branded voice-and-visual AI consultant on their website or social media bio link—proven live right here through NEXUS.',
    overview: [
      'Static websites and basic text chatbots rarely explain complex services well. Kairo Studio turns the interactive voice, holographic visual showcase, public company research, and consented lead-handover architecture we built for SmartNet NEXUS into a configurable SaaS product.',
      'Subscribing businesses brand and name their own AI representative, upload their services and past-project visuals, and deploy both a hosted link-in-bio page for social profiles and a drop-in website embed—capturing qualified enquiries for their human team around the clock.',
    ],
    capabilities: [
      'Custom-branded AI persona (name, voice, colours, knowledge base)',
      'Hosted Link-in-Bio consultant page + drop-in website embed',
      'Dynamic visual showcase deck triggered live during conversation',
      'Consented lead capture, Lead Inbox, email & webhook handover',
    ],
    highlights: [
      {
        title: 'Proven Live Through NEXUS',
        detail:
          'SmartNet NEXUS on this website serves as Kairo Studio’s working proof of concept—test it live before subscribing.',
      },
      {
        title: 'Website Embed & Social Bio Link',
        detail:
          'Deploy one AI representative across WordPress, Shopify, custom sites, LinkedIn, Instagram, and WhatsApp Business bios.',
      },
      {
        title: 'Built-in Guardrails & POPIA Consent',
        detail:
          'Strict brand-accuracy guardrails, explicit unbundled contact consent, and structured human handover.',
      },
    ],
    stack: ['Next.js', 'FastAPI', 'Supabase', 'Real-Time Voice AI', 'WebGL / 3D'],
    note: 'Kairo Studio is currently in active product development following SmartNet’s live NEXUS POC. Request early access or a walkthrough with our team.',
    isComingSoon: true,
    featured: true,
  },
  {
    slug: 'watchtower',
    code: '03 / CLOUD OPERATIONS',
    category: 'Kubernetes & DevOps Visibility',
    name: 'Watchtower',
    shortName: 'AKS',
    status: 'Platform Solution',
    description:
      'Watchtower brings operational context from multiple Azure Kubernetes Service (AKS) environments together to support infrastructure visibility, workload inspection, and faster troubleshooting.',
    tagline: 'Unified operational visibility across Azure Kubernetes Service clusters.',
    overview: [
      'Operating multiple Kubernetes clusters often forces engineering teams to jump between terminals, logs, ingress configs, and cloud portals during incidents. Watchtower consolidates multi-cluster operational context into a structured inspection layer.',
      'Designed around SmartNet’s hands-on Azure, Kubernetes, Docker, and GitOps experience, it surfaces cluster health, deployments, logs, and extended workload views without obscuring underlying engineering control.',
    ],
    capabilities: [
      'Multi-cluster AKS workload and node visibility',
      'Deployments, logs, ingress, and infrastructure context',
      'Operational inspection and troubleshooting workflows',
      'Extended data and ML workload views within platform scope',
    ],
    highlights: [
      {
        title: 'Multi-Cluster Context',
        detail:
          'Inspect clusters, nodes, deployments, and ingress state across environments from a single operational perspective.',
      },
      {
        title: 'Cloud-Native Architecture',
        detail:
          'Engineered around Azure Kubernetes Service, Docker containerisation, GitOps, and automated release pipelines.',
      },
    ],
    stack: ['Azure AKS', 'Kubernetes', 'Docker', 'GitOps', 'Observability'],
    coverImage: '/images/portfolio/cloud/1.png',
    gallery: [
      {
        src: '/images/portfolio/cloud/1.png',
        alt: 'Cloud and DevOps platform overview',
        caption: 'Multi-cloud and containerised operations architecture',
      },
      {
        src: '/images/portfolio/cloud/2.png',
        alt: 'Kubernetes cluster scaling and orchestration view',
        caption: 'Kubernetes orchestration across cloud environments',
      },
    ],
    note: 'Individual product capabilities and production rollout scope are verified through project-specific demonstrations and documentation.',
  },
  {
    slug: 'lmg-wms',
    code: '04 / BUSINESS APPLICATIONS',
    category: 'Automotive Workshop Software',
    name: 'LMG-WMS',
    shortName: 'WMS',
    status: 'SmartNet-Developed Software',
    tagline: 'Dedicated digital platform for structured automotive workshop operations.',
    description:
      'A SmartNet-developed workshop management application designed to organise workshop job information, operational workflows, and future system integrations.',
    overview: [
      'Built to replace fragmented spreadsheets and manual job-card tracking, LMG-WMS provides a dedicated operational foundation for automotive workshops.',
      'The architecture supports structured job tracking, workshop records, and modular expansion for reporting or licensed third-party vehicle-data integrations where authorised.',
    ],
    capabilities: [
      'Workshop job & operational process organisation',
      'Modular full-stack business application architecture',
      'Configurable workflow and reporting foundation',
      'Extensible for licensed third-party vehicle-data APIs',
    ],
    highlights: [
      {
        title: 'Operational Clarity',
        detail:
          'Centralises workshop information and workflows in one purpose-built web application.',
      },
      {
        title: 'Ready for Integration',
        detail:
          'Structured cleanly to extend into accounting, inventory, or licensed OEM data feeds within project scope.',
      },
    ],
    stack: ['Custom Web App', 'PostgreSQL', 'REST APIs', 'Workflow Automation'],
    note: 'Third-party OEM or vehicle-data integration requires the necessary licences and authorisations. Custom features and deployments are scoped per engagement.',
  },
  {
    slug: 'my-midwifey',
    code: '05 / HEALTHCARE MOBILE APP',
    category: 'Award-Winning iOS & Android App',
    name: 'My Midwifey',
    shortName: 'MID',
    status: 'Delivered · Award-Winning Build',
    tagline: 'Compassionate prenatal hypertension care companion for midwives.',
    description:
      'A native Android and iOS mobile application engineered in collaboration with University of Johannesburg postgraduate researcher Busisiwe Mdletshe to guide midwives through step-by-step prenatal hypertension assessment, supported by an interactive Midwife Bot.',
    overview: [
      'Engineered under our former brand name SwaartWare in partnership with postgraduate researcher Busisiwe Mdletshe (University of Johannesburg), My Midwifey was built to support midwives in managing hypertension during pregnancy.',
      'The mobile application combines an intuitive clinical workflow, an interactive Midwife Bot assistant, visual data insights, a peer collaboration hub, and role-based security—earning recognition with an award for the mobile app.',
    ],
    capabilities: [
      'Native Android & iOS mobile application',
      'Interactive Midwife Bot for step-by-step guidance',
      'Graphical monitoring and assessment insights',
      'Role-based access, security-first data handling & community hub',
    ],
    highlights: [
      {
        title: 'Research-Backed Engineering',
        detail:
          'Translated postgraduate maternal-healthcare research at the University of Johannesburg into a working cross-platform mobile product.',
      },
      {
        title: 'Midwife Bot & Visual Insights',
        detail:
          'Paired conversational assessment guidance with structured visual readouts to assist decision-making.',
      },
      {
        title: 'Award-Recognised Mobile Build',
        detail:
          'Recognised for practical local impact in maternal healthcare technology.',
      },
    ],
    stack: ['iOS & Android', 'Conversational Bot', 'Clinical Workflow UI', 'Security'],
    coverImage: '/images/portfolio/midwifey/1.png',
    gallery: [
      {
        src: '/images/portfolio/midwifey/1.png',
        alt: 'My Midwifey mobile app overview screen',
        caption: 'Welcome and primary care companion interface',
        portrait: true,
      },
      {
        src: '/images/portfolio/midwifey/2.png',
        alt: 'My Midwifey navigation and clinical guidance view',
        caption: 'Guided prenatal hypertension assessment workflow',
        portrait: true,
      },
      {
        src: '/images/portfolio/midwifey/6.png',
        alt: 'Midwife Bot conversational screen',
        caption: 'Interactive Midwife Bot assistance',
        portrait: true,
      },
      {
        src: '/images/portfolio/midwifey/8.png',
        alt: 'My Midwifey monitoring and insights screen',
        caption: 'Structured monitoring and decision-support view',
        portrait: true,
      },
    ],
    legacyBrand: true,
    note: 'Originally engineered under SwaartWare (now SmartNet Technologies) in collaboration with Busisiwe Mdletshe (UJ). Clinical tools support trained professionals and do not replace medical judgement.',
  },
  {
    slug: 'smartnet-tickets',
    code: '06 / SUPPORT & OPERATIONS SAAS',
    category: 'Issue Management Web App',
    name: 'Ticketing & Support Platform',
    shortName: 'TCK',
    status: 'Delivered Platform',
    tagline: 'Real-time issue tracking, support chat, and granular access control.',
    description:
      'A full-featured web ticketing platform (originally built as swaartTickets) designed to streamline customer inquiries, technical support workflows, role-based permissions, integrated chat, and searchable reporting.',
    overview: [
      'Developed under our former SwaartWare brand, this web application helps organisations replace scattered email threads with structured, real-time ticket management.',
      'Teams manage dynamic tickets with instant email alerts, broadcast announcements, live agent-to-customer chat, Elasticsearch-powered search, and full white-label company branding.',
    ],
    capabilities: [
      'Real-time ticket lifecycle & dynamic dashboard',
      'Granular role-based security permissions',
      'Integrated live support chat & instant email alerts',
      'Elasticsearch indexing, reporting & custom branding',
    ],
    highlights: [
      {
        title: 'Real-Time Collaboration',
        detail:
          'Synchronises agents and customers with live ticket updates and built-in private support messaging.',
      },
      {
        title: 'Customisable Branding & Security',
        detail:
          'Tailor logos, colours, layouts, and exact agent/customer access permissions per organisation.',
      },
    ],
    stack: ['Web Application', 'Real-Time Chat', 'Elasticsearch', 'RBAC', 'Reporting'],
    coverImage: '/images/portfolio/ticketsys/1.png',
    gallery: [
      {
        src: '/images/portfolio/ticketsys/1.png',
        alt: 'Ticketing platform main interface',
        caption: 'Centralised ticket dashboard and queue overview',
      },
      {
        src: '/images/portfolio/ticketsys/2.png',
        alt: 'Real-time ticket management view',
        caption: 'Real-time ticket tracking and assignment',
      },
      {
        src: '/images/portfolio/ticketsys/3.png',
        alt: 'Role-based security permissions screen',
        caption: 'Granular agent and customer permission controls',
      },
      {
        src: '/images/portfolio/ticketsys/4.png',
        alt: 'Integrated support chat view',
        caption: 'Built-in live support messaging',
      },
      {
        src: '/images/portfolio/ticketsys/6.png',
        alt: 'Customisable branding settings',
        caption: 'White-label branding and appearance settings',
      },
    ],
    legacyBrand: true,
    note: 'Originally developed as swaartTickets under SwaartWare (now SmartNet Technologies). Available for custom deployment and tailoring.',
  },
  {
    slug: 'prawductions-studio',
    code: '07 / WEB & BOOKING PLATFORM',
    category: 'Studio Booking Web App',
    name: 'Prawductions Studio',
    shortName: 'PRW',
    status: 'Delivered Client Build',
    tagline: 'Custom digital presence and studio booking platform.',
    description:
      'A tailored studio booking web platform built for Prawductions Studio to showcase services, streamline studio reservations, and manage client bookings online.',
    overview: [
      'Engineered under our former SwaartWare brand for Prawductions Studio, this web platform brings studio showcasing and booking workflows into a clean, responsive customer experience.',
      'Clients can browse offerings and book sessions online while the studio maintains a structured view of incoming requests.',
    ],
    capabilities: [
      'Online studio booking workflow',
      'Responsive custom web interface',
      'Service catalogue and scheduling flow',
      'Client inquiry and booking management',
    ],
    highlights: [
      {
        title: 'Frictionless Booking',
        detail:
          'Moves studio scheduling from back-and-forth messaging into a structured web experience.',
      },
      {
        title: 'Brand-First Presentation',
        detail:
          'Designed to showcase creative studio services cleanly across desktop and mobile.',
      },
    ],
    stack: ['Web Application', 'Booking Workflow', 'Responsive UI'],
    demoUrl: 'https://prawductions.com/',
    demoLabel: 'Visit Prawductions',
    coverImage: '/images/portfolio/prawduction/1.png',
    gallery: [
      {
        src: '/images/portfolio/prawduction/1.png',
        alt: 'Prawductions Studio landing page',
        caption: 'Primary studio showcase and entry experience',
      },
      {
        src: '/images/portfolio/prawduction/2.png',
        alt: 'Prawductions Studio booking interface',
        caption: 'Interactive studio booking flow',
      },
      {
        src: '/images/portfolio/prawduction/3.png',
        alt: 'Prawductions Studio service views',
        caption: 'Service options and session scheduling',
      },
      {
        src: '/images/portfolio/prawduction/6.png',
        alt: 'Prawductions Studio responsive interface',
        caption: 'Streamlined client reservation screens',
      },
    ],
    legacyBrand: true,
    note: 'Originally delivered under SwaartWare (now SmartNet Technologies). External client website availability is managed by the client.',
  },
  {
    slug: 'ai-learning-support',
    code: '08 / EDUCATION TECHNOLOGY',
    category: 'Responsible AI Initiative',
    name: 'AI Learning Support',
    shortName: 'EDU',
    status: 'In Development',
    tagline: 'Guided learner support built around human oversight and safeguarding.',
    description:
      'An education technology initiative exploring guided homework assistance, targeted explanations, and supplementary learner practice with clear educator and parent oversight.',
    overview: [
      'SmartNet is exploring how applied AI can strengthen foundational learning without replacing teachers or encouraging shortcuts.',
      'The initiative focuses on step-by-step guided explanations, structured practice, and practical safeguarding controls suitable for South African learners and institutions.',
    ],
    capabilities: [
      'Guided homework assistance concepts',
      'Targeted step-by-step learning explanations',
      'Supplementary learner practice support',
      'Safeguarding and teacher/parent oversight considerations',
    ],
    highlights: [
      {
        title: 'Human Oversight First',
        detail:
          'Designed to complement educators and parents rather than act as an unmonitored answer generator.',
      },
    ],
    stack: ['Applied AI', 'Education Workflows', 'Safeguarding'],
    note: 'This platform is under active development and is not presented as an established deployed education service.',
  },
];

export function getSolutionBySlug(slug: string): SolutionItem | undefined {
  return SOLUTIONS.find((item) => item.slug === slug);
}

export const CLIENT_BRANDS = [
  {
    name: 'TFG Limited',
    url: 'https://www.tfglimited.co.za',
    logo: '/images/clients/tfg.png',
  },
  {
    name: 'LUB Motor Group',
    url: 'https://www.lubmotorgroup.co.za',
    logo: '/images/clients/lub.png',
  },
  {
    name: 'Guma Protection',
    url: 'https://www.gumaprotection.co.za',
    logo: '/images/clients/guma.png',
  },
  {
    name: 'Limefolds',
    url: 'https://www.limefolds.co.za',
    logo: '/images/clients/limefold.png',
  },
  {
    name: 'Boto360 Africa',
    url: 'https://www.boto360.africa',
    logo: '/images/clients/boto.png',
  },
  {
    name: 'Royal Unlimited Projects',
    url: 'https://www.royalunlimitedprojects.co.za',
    logo: '/images/clients/royal.png',
  },
  {
    name: 'The Local Hanger',
    url: 'https://www.thelocalhanger.co.za',
    logo: '/images/clients/local.png',
  },
] as const;

export const ADDITIONAL_WEB_BUILDS = [
  {
    name: 'LUB Motor Group',
    category: 'Automotive Website',
    url: 'https://lubmotorgroup.co.za/',
  },
  {
    name: 'DJ Maczito',
    category: 'Artist & Brand Website',
    url: 'https://maczito.co.za/',
  },
  {
    name: 'The Local Hanger',
    category: 'Retail Digital Presence',
    url: 'https://thelocalhanger.co.za/',
  },
  {
    name: 'Bantu Kings',
    category: 'Brand Web Platform',
    url: 'https://bantukings.co.za/',
  },
] as const;

export const DELIVERY_STAGES = [
  ['01', 'Discover', 'Understand requirements, workflows and constraints'],
  ['02', 'Architect', 'Define the technical approach and delivery roadmap'],
  ['03', 'Engineer', 'Build, integrate and automate'],
  ['04', 'Validate', 'Test behaviour, security and recoverability'],
  ['05', 'Launch', 'Deploy, document and transfer knowledge'],
  ['06', 'Improve', 'Optimise and iterate where engaged'],
] as const;


export type TestimonialItem = {
  id: string;
  quote: string;
  attribution: string;
  role: string;
  sector: string;
  projectSlug: string;
  projectName: string;
  badge: string;
};

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rfg',
    quote:
      'Turns complex road-condition surveys and 10-year maintenance scenarios into clear, decision-maker-ready financial motivations and risk narratives.',
    attribution: 'SA Roads Funding Gap',
    role: 'Infrastructure Decision-Support Platform',
    sector: 'PUBLIC INFRASTRUCTURE',
    projectSlug: 'road-funding-gap',
    projectName: 'SA Roads Funding Gap (RFG)',
    badge: 'LIVE DEMO',
  },
  {
    id: 'midwifey',
    quote:
      'Engineered from postgraduate clinical research at the University of Johannesburg into an award-recognised Android and iOS care companion with an interactive Midwife Bot.',
    attribution: 'My Midwifey Mobile App',
    role: 'Research Collaboration · Busisiwe Mdletshe (UJ)',
    sector: 'HEALTHCARE MOBILE',
    projectSlug: 'my-midwifey',
    projectName: 'My Midwifey',
    badge: 'AWARD-WINNING BUILD',
  },
  {
    id: 'tickets',
    quote:
      'Brings real-time ticket management, role-based access control, integrated live support chat, Elasticsearch indexing, and white-label branding into one unified operations desk.',
    attribution: 'SmartNet Ticketing Platform',
    role: 'Issue Management & Customer Support Web App',
    sector: 'BUSINESS OPERATIONS',
    projectSlug: 'smartnet-tickets',
    projectName: 'Ticketing & Support Platform',
    badge: 'DELIVERED PLATFORM',
  },
  {
    id: 'watchtower',
    quote:
      'Consolidates multi-cluster Azure Kubernetes Service workloads, logs, ingress, and deployment state into a single engineering-grade operational visibility layer.',
    attribution: 'Watchtower Cloud Operations',
    role: 'Kubernetes & DevOps Platform Scope',
    sector: 'CLOUD & DEVOPS',
    projectSlug: 'watchtower',
    projectName: 'Watchtower',
    badge: 'AZURE AKS',
  },
];
