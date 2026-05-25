export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'iSwitch Google',
  company: 'iSwitch Distributors',
  tagline: 'Authorized Google Pixel Distributor Portal',
  supportEmail: 'support@iswitchgoogle.com',
  schemeNote: 'Cashback applicable via Pinelab terminals at select stores.',
}

export const ROUTES = {
  login: '/auth/login',
  signup: '/auth/signup',
  pending: '/auth/pending',
  verify: '/auth/verify',
  retailer: {
    home: '/retailer',
    schemes: '/retailer/schemes',
  },
  admin: {
    home: '/admin',
    schemes: '/admin/schemes',
    schemesNew: '/admin/schemes/new',
    retailers: '/admin/retailers',
  },
}
