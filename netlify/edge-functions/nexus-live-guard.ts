// Netlify rate limit for the Gemini Live token endpoint.
// Only the token endpoint is subject to this rule.

export default async function guard(
  _request: Request,
  context: { next: () => Promise<Response> }
) {
  return context.next();
}

export const config = {
  path: '/api/nexus/live-token',
  method: 'POST',
  rateLimit: {
    windowLimit: 4,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
