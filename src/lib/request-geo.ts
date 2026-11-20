export type RequestGeo = {
  ipAddress: string;
  city: string;
  region: string;
  countryCode: string;
  countryName: string;
  timezone: string;
  userAgent: string;
};

function clean(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function decodeHeaderValue(value: string | null, limit: number): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value).trim().slice(0, limit);
  } catch {
    return value.trim().slice(0, limit);
  }
}

export function extractRequestGeo(request: Request): RequestGeo {
  const headers = request.headers;

  const rawIp =
    headers.get('x-nf-client-connection-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    '';

  let city = '';
  let region = '';
  let countryCode = '';
  let countryName = '';
  let timezone = '';

  // Netlify native Base64 JSON geo header
  const nfGeo = headers.get('x-nf-geo');
  if (nfGeo) {
    try {
      const parsed = JSON.parse(
        Buffer.from(nfGeo, 'base64').toString('utf8')
      ) as {
        city?: string;
        timezone?: string;
        country?: { code?: string; name?: string };
        subdivision?: { code?: string; name?: string };
      };
      city = clean(parsed.city, 120);
      region = clean(parsed.subdivision?.name || parsed.subdivision?.code, 120);
      countryCode = clean(parsed.country?.code, 12);
      countryName = clean(parsed.country?.name, 120);
      timezone = clean(parsed.timezone, 80);
    } catch {
      // Ignore malformed proxy geo header.
    }
  }

  // Fallback headers (Vercel / Cloudflare / generic reverse proxies)
  if (!city) {
    city = decodeHeaderValue(
      headers.get('x-vercel-ip-city') || headers.get('cf-ipcity'),
      120
    );
  }
  if (!region) {
    region = decodeHeaderValue(
      headers.get('x-vercel-ip-country-region') || headers.get('cf-region'),
      120
    );
  }
  if (!countryCode) {
    countryCode = clean(
      headers.get('x-vercel-ip-country') ||
        headers.get('cf-ipcountry') ||
        headers.get('x-country-code'),
      12
    );
  }
  if (!countryName && countryCode) {
    try {
      const display = new Intl.DisplayNames(['en'], { type: 'region' });
      countryName = clean(display.of(countryCode.toUpperCase()), 120);
    } catch {
      countryName = countryCode;
    }
  }
  if (!timezone) {
    timezone = clean(
      headers.get('x-vercel-ip-timezone') || headers.get('cf-timezone'),
      80
    );
  }

  return {
    ipAddress: clean(rawIp, 80),
    city,
    region,
    countryCode,
    countryName,
    timezone,
    userAgent: clean(headers.get('user-agent'), 300),
  };
}
