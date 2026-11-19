import { Behavior, Type, type Tool } from '@google/genai';

export const NEXUS_RESEARCH_TOOLS: Tool[] = [{
  functionDeclarations: [
    {
      name: 'present_visual',
      description: 'Select an approved holographic scene before explaining it. This only changes presentation; it does not research or save anything.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          scene: {
            type: Type.STRING,
            enum: ['welcome', 'software', 'cloud', 'watchtower', 'workshop', 'roads', 'education', 'business', 'research', 'followup', 'clear'],
          },
        },
        required: ['scene'],
      },
    },
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
    {
      name: 'offer_followup',
      description:
        'Offer or open the SmartNet human follow-up handover form. Use mode="offer" only after understanding the visitor main challenge and discussing a relevant SmartNet approach—never immediately after research finishes. Use mode="open" when the visitor explicitly asks for a call, quote, proposal, or contact with the team, or accepts a follow-up offer.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          mode: {
            type: Type.STRING,
            enum: ['offer', 'open'],
            description:
              '"offer" shows two floating choices (Arrange a follow-up / Keep exploring). "open" opens the handover form after your spoken turn finishes.',
          },
          summary: {
            type: Type.STRING,
            description:
              'Short 1 to 3 sentence plain-text consultation summary of what the visitor wants help with, editable by the visitor before submitting. Never include unverified claims.',
          },
        },
        required: ['mode', 'summary'],
      },
    },
  ],
}];
