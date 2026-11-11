export default async function guard(
  _request: Request,
  context: { next: () => Promise<Response> }
) {
  return context.next();
}

export const config = {
  path: '/api/nexus/chat',
  method: 'POST',
  rateLimit: {
    windowLimit: 12,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
