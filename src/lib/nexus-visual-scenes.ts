export type NexusScene = {
  title: string;
  text: string;
  label: string;
  tags: string[];
  diagram: 'architecture' | 'globe';
  image?: string;
  imageAlt?: string;
  choices: { label: string; prompt: string; action?: 'open-handover' | 'keep-exploring' }[];
};

export const NEXUS_SCENES: Record<string, NexusScene> = {
  welcome: {
    title: 'Let’s explore what is possible.',
    text: 'Discover SmartNet, explore our work, or describe a business challenge.',
    label: 'YOUR NEXT STEP',
    tags: ['DISCOVER', 'EXPLORE', 'DISCUSS'],
    diagram: 'globe',
    choices: [
      { label: 'Explore SmartNet', prompt: 'Tell me about SmartNet and its services.' },
      { label: 'Show your work', prompt: 'Show me a relevant SmartNet project and explain its purpose.' },
      { label: 'My business', prompt: 'Help me explore how SmartNet could help my business. Ask about my company and challenge.' },
    ],
  },
  software: {
    title: 'Software around your operations.',
    text: 'Applications, workflows, APIs and databases shaped around business requirements.',
    label: 'SOFTWARE ENGINEERING',
    tags: ['APPLICATIONS', 'APIs', 'DATA'],
    diagram: 'architecture',
    choices: [
      { label: 'Explore a workflow', prompt: 'Help me identify a workflow that could benefit from custom software.' },
      { label: 'Explain integration', prompt: 'Explain how SmartNet approaches integrating business systems.' },
    ],
  },
  cloud: {
    title: 'From deployment to dependable operation.',
    text: 'Cloud architecture, infrastructure automation, delivery pipelines and operational visibility.',
    label: 'CLOUD AND DEVOPS',
    tags: ['AZURE', 'AUTOMATION', 'OPERATIONS'],
    diagram: 'architecture',
    choices: [
      { label: 'Show Watchtower', prompt: 'Explain Watchtower and its documented platform scope.' },
      { label: 'Discuss my infrastructure', prompt: 'Ask me about my current infrastructure and operational challenges.' },
    ],
  },
  watchtower: {
    title: 'Watchtower',
    text: 'A SmartNet platform focused on visibility across AKS environments and related operational resources.',
    label: 'PROJECT OVERVIEW',
    tags: ['AKS', 'VISIBILITY', 'OPERATIONS'],
    diagram: 'architecture',
    choices: [
      { label: 'How it works', prompt: 'Explain the documented design and capabilities of Watchtower. Distinguish known implementation facts from proposed architecture.' },
      { label: 'My cloud environment', prompt: 'Explore whether a similar approach could help my cloud environment.' },
    ],
  },
  workshop: {
    title: 'LMG-WMS',
    text: 'SmartNet-developed workshop management software for organising workshop information and operational workflows.',
    label: 'PROJECT OVERVIEW',
    tags: ['WORKSHOP', 'WORKFLOWS', 'INFORMATION'],
    diagram: 'architecture',
    choices: [
      { label: 'Explore the problem', prompt: 'Explain the workshop problems LMG-WMS is designed to address without inventing deployment outcomes.' },
      { label: 'My operations', prompt: 'Ask about my operational workflows and how software could help.' },
    ],
  },
  roads: {
    title: 'Road Funding Gap',
    text: 'Decision support for comparing road-maintenance investment scenarios and developing budget motivations.',
    label: 'PROJECT OVERVIEW',
    tags: ['CONDITION', 'SCENARIOS', 'PLANNING'],
    diagram: 'architecture',
    choices: [
      { label: 'Explain a scenario', prompt: 'Explain a hypothetical road funding scenario, clearly labelling assumptions and avoiding invented project results.' },
      { label: 'Required information', prompt: 'What information would be needed to explore road funding scenarios?' },
    ],
  },
  education: {
    title: 'Learning support with human oversight.',
    text: 'An education technology initiative under development, exploring guided assistance and supplementary practice.',
    label: 'INITIATIVE IN DEVELOPMENT',
    tags: ['GUIDANCE', 'PRACTICE', 'OVERSIGHT'],
    diagram: 'architecture',
    choices: [
      { label: 'Explore the concept', prompt: 'Explain SmartNet’s learning support initiative and its current development status.' },
      { label: 'Discuss a learning need', prompt: 'Ask about the learning support need I want to address.' },
    ],
  },
  business: {
    title: 'Start with the business problem.',
    text: 'Understand the current process, the friction it creates and the outcome you want to achieve.',
    label: 'BUSINESS DISCOVERY',
    tags: ['PEOPLE', 'PROCESS', 'TECHNOLOGY'],
    diagram: 'globe',
    choices: [
      { label: 'Research my company', prompt: 'I would like public company research. Ask me for the company name or website before searching.' },
      { label: 'Explain my challenge', prompt: 'I would like to describe my business challenge. Ask me one discovery question.' },
    ],
  },
  research: {
    title: 'Explore your public business presence.',
    text: 'Research uses available public sources. NEXUS will ask for your company details and permission before searching.',
    label: 'COMPANY RESEARCH',
    tags: ['DISCOVER', 'CONFIRM', 'EXPLORE'],
    diagram: 'globe',
    choices: [
      { label: 'Supply company details', prompt: 'Ask me for my company name or website for public-source research.' },
      { label: 'Continue without research', prompt: 'Continue without researching. Ask about my business challenge.' },
    ],
  },
  followup: {
    title: 'Continue with our team?',
    text: 'You can review a short summary and request a follow-up from a SmartNet team member, or keep exploring here.',
    label: 'HUMAN HANDOVER',
    tags: ['SUMMARY', 'FOLLOW-UP', 'SMARTNET TEAM'],
    diagram: 'globe',
    choices: [
      {
        label: 'Arrange a follow-up',
        prompt: 'I would like to arrange a follow-up with the SmartNet team.',
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
VISUAL PRESENTATION
You can control the holographic presentation using present_visual.
Use it before a substantial explanation of a SmartNet service or project,
or when offering a relevant next step. Do not call it for every sentence.
Available scenes: welcome, software, cloud, watchtower, workshop, roads,
education, business, research. Use clear to dismiss contextual panels.
Use welcome for the opening invitation.
Select the scene that matches what you are about to explain.
The application supplies approved panel copy and follow-up choices.
These diagrams are illustrative; no project screenshots are connected yet.
Never claim the visitor is viewing an actual project screenshot or a
verified project architecture when only an illustration is available.
Showing research does not start a search. The visitor starts public
research by submitting the typed input; do not call research_company from speech.
COMPANY INPUT EXPERIENCE
For company discovery, say:
"To explore your business, please type your company name or website in the input below."
Then pause and allow the visitor to type.
The application displays one company-name-or-website input after your spoken turn ends.
Do not ask the visitor to dictate or spell the company name aloud.
Do not request a separate location, address, email or website field.
Do not call research_company based on speech. Research starts when the
visitor submits the typed input. Do not claim a search started until the
application confirms it. If asked to research, invite the visitor to use
the input and pause. Do not read out these interface instructions.
RESEARCH CONVERSATION FLOW
When inviting company input, select the research scene before speaking.
The application displays a floating input only after playback finishes.
The background is blurred and microphone transmission pauses while typing.
After submission, the application manages research progress announcements.
Do not invent progress or repeat an announcement already given.
For APPLICATION RESEARCH UPDATE messages, follow the supplied stage instruction.
Do not select research again merely to narrate progress or results.
The visitor must confirm an apparent company match before tailored advice.
After confirmation, briefly summarise verified findings, suggest at most two
relevant SmartNet opportunities, and ask whether they already have a challenge
in mind. Clearly distinguish suggestions from verified facts about their systems.
Use calm, warm delivery, concise sentences and natural pauses.
Do not claim to feel emotions or to know the visitor's emotional state.
HUMAN HANDOVER FLOW
Only offer a human follow-up using offer_followup(mode="offer", summary) after you
understand the visitor's main challenge and have discussed a relevant SmartNet approach.
Never trigger follow-up merely because company research finished.
When offering a follow-up, summarise their need in one calm sentence and ask whether
they would like someone from SmartNet to contact them to discuss next steps.
If the visitor explicitly asks for a call, quote, proposal, or contact with the team,
or accepts your follow-up offer, call offer_followup(mode="open", summary) with a concise,
accurate 1-3 sentence summary, briefly explain you are opening the short follow-up form,
and finish speaking so the form appears.
Never claim a call is booked, promise a response timeframe, or say an enquiry was saved.
Presentation actions do not relax any SmartNet-only scope or accuracy rules.
`;


export const SMARTNET_TYPED_GREETING =
  "Welcome to SmartNet Technologies. I'm NEXUS, your AI technology consultant. " +
  "You can ask me about SmartNet or the solutions we build. " +
  "To explore your business, please type your company name or website in the input below.";
