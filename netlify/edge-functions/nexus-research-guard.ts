export default async function guard(
  _request: Request,
  context: { next: () => Promise<Response> }
) {
  return context.next();
}

export const config = {
  path: '/api/nexus/research',
  method: 'POST',
  rateLimit: {
    windowLimit: 2,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
