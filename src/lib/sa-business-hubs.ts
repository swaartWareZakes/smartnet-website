export type BusinessHub = {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  source: string;
  offsetX: number;
  offsetY: number;
};

// Addresses verified from official company contact pages.
// Coordinates are approximate metro-level map markers,
// not surveyed building locations.
// Offsets separate nearby pins for easier selection.
//
// This is a curated directory demonstration.
// These organisations are NOT represented as SmartNet clients.

export const SA_BUSINESS_HUBS: BusinessHub[] = [
  {
    id: 'standard-bank',
    name: 'Standard Bank Group',
    city: 'Johannesburg',
    address: '5 Simmonds Street, Johannesburg, 2001',
    latitude: -26.2041,
    longitude: 28.0473,
    offsetX: -0.10,
    offsetY: -0.05,
    source: 'https://www.standardbank.com/sbg/standard-bank-group/contact-us',
  },
  {
    id: 'absa',
    name: 'Absa Group',
    city: 'Johannesburg',
    address: 'Absa Towers West, 15 Troye Street, Johannesburg, 2001',
    latitude: -26.2041,
    longitude: 28.0473,
    offsetX: 0.08,
    offsetY: -0.10,
    source: 'https://www.absa.africa/contact-us/',
  },
  {
    id: 'nedbank',
    name: 'Nedbank Group',
    city: 'Sandton',
    address: '135 Rivonia Road, Sandown, Sandton, 2196',
    latitude: -26.1076,
    longitude: 28.0567,
    offsetX: -0.15,
    offsetY: 0.09,
    source: 'https://group.nedbank.co.za/home/contact-us.html',
  },
  {
    id: 'fnb',
    name: 'FNB / FirstRand',
    city: 'Sandton',
    address: '4 Merchant Place, corner Fredman Drive and Rivonia Road, Sandton, 2196',
    latitude: -26.1076,
    longitude: 28.0567,
    offsetX: 0.03,
    offsetY: 0.14,
    source: 'https://www.fnb.co.za/global-commercial-banking/contact-us.html',
  },
  {
    id: 'investec-jhb',
    name: 'Investec — Johannesburg',
    city: 'Sandton',
    address: '100 Grayston Drive, Sandown, Sandton, 2196',
    latitude: -26.1076,
    longitude: 28.0567,
    offsetX: 0.17,
    offsetY: 0.02,
    source: 'https://www.investec.com/en_za/welcome-to-investec/contact-us/gauteng-offices.html',
  },
  {
    id: 'discovery',
    name: 'Discovery Bank',
    city: 'Sandton',
    address: '1 Discovery Place, Sandton, 2196',
    latitude: -26.1076,
    longitude: 28.0567,
    offsetX: 0.04,
    offsetY: -0.15,
    source: 'https://www.discovery.co.za/corporate/contact-us',
  },
  {
    id: 'capitec',
    name: 'Capitec Bank',
    city: 'Stellenbosch',
    address: '5 Neutron Road, Techno Park, Stellenbosch, 7600',
    latitude: -33.9346,
    longitude: 18.8668,
    offsetX: 0.08,
    offsetY: 0.03,
    source: 'https://www.capitecbank.co.za/investor-relations/shareholder-centre/',
  },
  {
    id: 'investec-cpt',
    name: 'Investec — Cape Town',
    city: 'Cape Town',
    address: '14 Dock Road, V&A Waterfront, Cape Town, 8001',
    latitude: -33.9249,
    longitude: 18.4241,
    offsetX: -0.08,
    offsetY: 0.02,
    source: 'https://www.investec.com/en_za/welcome-to-investec/contact-us/western-cape-offices.html',
  },
  {
    id: 'investec-dbn',
    name: 'Investec — Durban',
    city: 'Umhlanga',
    address: '5 Richefond Circle, Ridgeside Office Park, Umhlanga, 4319',
    latitude: -29.7276,
    longitude: 31.0855,
    offsetX: 0.02,
    offsetY: 0,
    source: 'https://www.investec.com/en_za/welcome-to-investec/contact-us/kwazulu-natal-offices.html',
  },
  {
    id: 'investec-pta',
    name: 'Investec — Pretoria',
    city: 'Pretoria',
    address: 'Corner Atterbury and Klarinet Streets, Menlo Park, Pretoria, 0081',
    latitude: -25.7479,
    longitude: 28.2293,
    offsetX: 0,
    offsetY: 0.22,
    source: 'https://www.investec.com/en_za/welcome-to-investec/contact-us/gauteng-offices.html',
  },
  {
    id: 'investec-gqeberha',
    name: 'Investec — Gqeberha',
    city: 'Gqeberha',
    address: 'Waterfront Business Park, Pommern Street, Humerail, Gqeberha, 6045',
    latitude: -33.9608,
    longitude: 25.6022,
    offsetX: 0,
    offsetY: 0,
    source: 'https://www.investec.com/en_za/welcome-to-investec/contact-us/eastern-cape-offices.html',
  },
];
