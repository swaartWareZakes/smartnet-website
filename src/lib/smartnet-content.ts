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

export const SOLUTIONS = [
  {
    code: '01 / PUBLIC INFRASTRUCTURE',
    name: 'Road Funding Gap',
    shortName: 'RFG',
    status: 'Decision-support initiative',
    description:
      'Road Funding Gap helps road authorities analyse the financial consequences of road maintenance decisions, compare investment scenarios and develop evidence-based budget motivations.',
    capabilities: [
      'Road-condition and intervention assumptions',
      'Comparative maintenance expenditure scenarios',
      'Deferred-maintenance funding exposure',
      'Decision-support reports and visualisations',
    ],
    note:
      'Scenario estimates depend on the quality of input data and engineering assumptions. They are not a substitute for independently certified cost estimates where these are required.',
  },
  {
    code: '02 / CLOUD OPERATIONS',
    name: 'Watchtower',
    shortName: 'AKS',
    status: 'Platform solution',
    description:
      'Watchtower brings operational context from multiple Azure Kubernetes Service environments together to support infrastructure visibility and troubleshooting.',
    capabilities: [
      'Multi-cluster workload visibility',
      'Logs, deployments and infrastructure context',
      'Operational inspection',
      'Extended data and ML workload views within platform scope',
    ],
    note:
      'Individual product capabilities and production rollout status are verified through project-specific demonstrations and documentation.',
  },
  {
    code: '03 / BUSINESS APPLICATIONS',
    name: 'LMG-WMS',
    shortName: 'WMS',
    status: 'SmartNet-developed software',
    description:
      'A SmartNet-developed workshop management application designed to structure workshop information, operational workflows and future integrations.',
    capabilities: [
      'Workshop process organisation',
      'Business application architecture',
      'Configurable workflow foundation',
      'Potential third-party vehicle-data integrations',
    ],
    note:
      'Third-party OEM or vehicle-data integration requires the necessary licences and authorisations. Customer deployments and individual features require separate evidence.',
  },
  {
    code: '04 / EDUCATION TECHNOLOGY',
    name: 'AI Learning Support',
    shortName: 'EDU',
    status: 'In development',
    description:
      'An education technology initiative exploring guided homework assistance, targeted explanations and supplementary learning experiences.',
    capabilities: [
      'Guided homework assistance concepts',
      'Targeted learning explanations',
      'Learner practice support',
      'Safeguarding and human oversight considerations',
    ],
    note:
      'This platform is under development and is not presented as an established deployed education service.',
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
