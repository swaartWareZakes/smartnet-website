import { Behavior, Type, type Tool } from '@google/genai';

export const NEXUS_RESEARCH_TOOLS: Tool[] = [{
  functionDeclarations: [
    {
      name: 'research_company',
      description:
        'Research the visitor business using public sources to explore relevant SmartNet services. Only call after the visitor agrees to a public search and confirms the company name or website. Never use for general questions or private individuals.',
      behavior: Behavior.NON_BLOCKING,
      parameters: {
        type: Type.OBJECT,
        properties: {
          company: {
            type: Type.STRING,
            description: 'Company name confirmed by the visitor, or empty if only a website is known.',
          },
          website: {
            type: Type.STRING,
            description: 'Website explicitly supplied by the visitor. Never invent one. Use empty string if unknown.',
          },
          location: {
            type: Type.STRING,
            description: 'City/country supplied by the visitor, or empty if unknown.',
          },
        },
        required: ['company', 'website', 'location'],
      },
    },
    {
      name: 'confirm_company_match',
      description:
        'Record the visitor response after asking whether the researched company is theirs. Only confirm when the visitor explicitly agrees.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          confirmed: { type: Type.BOOLEAN },
        },
        required: ['confirmed'],
      },
    },
    {
      name: 'cancel_company_research',
      description: 'Cancel the pending search when the visitor asks to stop researching.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
      },
    },
  ],
}];
