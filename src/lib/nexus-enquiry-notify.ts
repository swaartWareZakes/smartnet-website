export type EnquiryNotificationPayload = {
  id: string;
  status: string;
  visitorName: string;
  email: string;
  phone: string;
  companyName: string;
  companyWebsite: string;
  preferredContact: 'email' | 'phone';
  summary: string;
  researchLinks: { title: string; url: string }[];
  consentAt: string;
  transcriptIncluded: boolean;
  transcriptCount: number;
};

export type NotificationResult = {
  status: 'sent' | 'skipped' | 'failed';
  channel?: 'netlify-forms' | 'resend' | 'webhook';
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveNetlifyFormEndpoint(): string | null {
  return process.env.NETLIFY_FORMS_URL?.trim() || null;
}

export async function notifySmartnetEnquiry(
  lead: EnquiryNotificationPayload,
): Promise<NotificationResult> {
  const to =
    process.env.SMARTNET_ENQUIRY_TO_EMAIL?.trim() || 'info@smartnetsa.co.za';
  const from =
    process.env.SMARTNET_ENQUIRY_FROM_EMAIL?.trim() ||
    'SmartNet NEXUS <noreply@smartnetsa.co.za>';
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const webhookUrl = process.env.SMARTNET_ENQUIRY_WEBHOOK_URL?.trim();
  const netlifyFormUrl = resolveNetlifyFormEndpoint();

  const linksText = lead.researchLinks.length
    ? lead.researchLinks.map((l) => `- ${l.title}: ${l.url}`).join('\n')
    : 'None';

  // 1. Netlify Forms (zero extra services when deployed on Netlify)
  if (netlifyFormUrl) {
    try {
      const formBody = new URLSearchParams({
        'form-name': 'nexus-enquiry',
        'bot-field': '',
        enquiry_id: lead.id,
        status: lead.status,
        visitor_name: lead.visitorName,
        email: lead.email,
        phone: lead.phone || 'Not provided',
        preferred_contact: lead.preferredContact,
        company_name: lead.companyName || 'Not provided',
        company_website: lead.companyWebsite || 'Not provided',
        summary: lead.summary,
        research_links: linksText,
        consent_timestamp: lead.consentAt,
        transcript_saved: lead.transcriptIncluded
          ? `Yes (${lead.transcriptCount} messages in Supabase)`
          : 'No',
      });

      const response = await fetch(netlifyFormUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SmartNet-NEXUS-Handover/1.0',
        },
        signal: AbortSignal.timeout(10000),
        body: formBody.toString(),
      });

      if (response.ok) {
        return { status: 'sent', channel: 'netlify-forms' };
      }
      console.error('[NEXUS enquiry notify] Netlify Forms error', {
        status: response.status,
      });
    } catch {
      console.error('[NEXUS enquiry notify] Netlify Forms request failed');
    }
  }

  // 2. Resend fallback if configured
  const subjectCompany = lead.companyName ? ` (${lead.companyName})` : '';
  const subject = `[NEXUS] New enquiry from ${lead.visitorName}${subjectCompany}`;

  if (resendKey) {
    const textBody = [
      `Status: ${lead.status}`,
      `Enquiry ID: ${lead.id}`,
      `Name: ${lead.visitorName}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone || 'Not provided'}`,
      `Preferred contact method: ${lead.preferredContact}`,
      `Company: ${lead.companyName || 'Not provided'}`,
      `Company website: ${lead.companyWebsite || 'Not provided'}`,
      '',
      'Approved consultation summary:',
      lead.summary,
      '',
      'Relevant research links:',
      linksText,
      '',
      `Contact consent timestamp: ${lead.consentAt}`,
      'Marketing opt-in: No',
      `Full conversation saved: ${
        lead.transcriptIncluded
          ? `Yes (${lead.transcriptCount} messages in Supabase)`
          : 'No'
      }`,
    ].join('\n');

    const linksHtml = lead.researchLinks.length
      ? `<ul>${lead.researchLinks
          .map(
            (l) =>
              `<li><a href="${escapeHtml(l.url)}">${escapeHtml(l.title)}</a></li>`
          )
          .join('')}</ul>`
      : '<p>None</p>';

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px">
        <h2 style="margin:0 0 12px">New NEXUS Enquiry</h2>
        <p style="margin:0 0 16px"><strong>Status:</strong> ${escapeHtml(lead.status)} &middot; <strong>ID:</strong> ${escapeHtml(lead.id)}</p>
        <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
          <tr><td style="padding:6px 10px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:6px 10px;border:1px solid #ddd">${escapeHtml(lead.visitorName)}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:6px 10px;border:1px solid #ddd">${escapeHtml(lead.email)}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:6px 10px;border:1px solid #ddd">${escapeHtml(lead.phone || 'Not provided')}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd"><strong>Preferred contact</strong></td><td style="padding:6px 10px;border:1px solid #ddd">${escapeHtml(lead.preferredContact)}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd"><strong>Company</strong></td><td style="padding:6px 10px;border:1px solid #ddd">${escapeHtml(lead.companyName || 'Not provided')}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd"><strong>Website</strong></td><td style="padding:6px 10px;border:1px solid #ddd">${
            lead.companyWebsite
              ? `<a href="${escapeHtml(lead.companyWebsite)}">${escapeHtml(lead.companyWebsite)}</a>`
              : 'Not provided'
          }</td></tr>
        </table>
        <h3 style="margin:16px 0 6px">Approved consultation summary</h3>
        <p style="white-space:pre-wrap;background:#f5f7f9;padding:12px;border-radius:6px">${escapeHtml(lead.summary)}</p>
        <h3 style="margin:16px 0 6px">Relevant research links</h3>
        ${linksHtml}
        <p style="margin-top:18px;font-size:12px;color:#555">
          Contact consent recorded: ${escapeHtml(lead.consentAt)}<br/>
          Marketing opt-in: No<br/>
          Full conversation saved: ${
            lead.transcriptIncluded
              ? `Yes (${lead.transcriptCount} messages stored in Supabase)`
              : 'No'
          }
        </p>
      </div>
    `.trim();

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: lead.email,
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });
      if (response.ok) {
        return { status: 'sent', channel: 'resend' };
      }
      console.error('[NEXUS enquiry notify] Resend error', {
        status: response.status,
      });
      return { status: 'failed', channel: 'resend' };
    } catch {
      console.error('[NEXUS enquiry notify] Resend request failed');
      return { status: 'failed', channel: 'resend' };
    }
  }

  // 3. Optional custom webhook
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ to, subject, lead }),
      });
      if (response.ok) {
        return { status: 'sent', channel: 'webhook' };
      }
      console.error('[NEXUS enquiry notify] Webhook error', {
        status: response.status,
      });
      return { status: 'failed', channel: 'webhook' };
    } catch {
      console.error('[NEXUS enquiry notify] Webhook request failed');
      return { status: 'failed', channel: 'webhook' };
    }
  }

  console.info(
    '[NEXUS enquiry notify] Saved to Supabase. Netlify Forms email delivery runs automatically once deployed to Netlify (or set NETLIFY_FORMS_URL locally).'
  );
  return { status: 'skipped' };
}
