export const COMPANY_BRAND_COLORS: Record<string, { primary: string; light: string; dark: string }> = {
  google: {
    primary: '#ffde3b',
    light: 'rgba(251, 255, 0, 0.85)',
    dark: 'rgb(242, 255, 0)',
  },
  microsoft: {
    primary: '#0088ff',
    light: 'rgba(0, 164, 239, 0.15)',
    dark: 'rgba(0, 164, 239, 0.35)',
  },
  meta: {
    primary: '#00b7ff',
    light: 'rgba(6, 104, 225, 0.15)',
    dark: 'rgba(6, 104, 225, 0.35)',
  },
  amazon: {
    primary: '#FF9900',
    light: 'rgba(255, 153, 0, 0.15)',
    dark: 'rgba(255, 153, 0, 0.35)',
  },
  apple: {
    primary: '#A2AAAD',
    light: 'rgba(162, 170, 173, 0.15)',
    dark: 'rgba(162, 170, 173, 0.35)',
  },
  netflix: {
    primary: '#E50914',
    light: 'rgba(229, 9, 20, 0.15)',
    dark: 'rgba(229, 9, 20, 0.35)',
  },
  tesla: {
    primary: '#CC0000',
    light: 'rgba(204, 0, 0, 0.15)',
    dark: 'rgba(204, 0, 0, 0.35)',
  },
  nvidia: {
    primary: '#76B900',
    light: 'rgba(118, 185, 0, 0.15)',
    dark: 'rgba(118, 185, 0, 0.35)',
  },
  salesforce: {
    primary: '#00A1E0',
    light: 'rgba(0, 161, 224, 0.15)',
    dark: 'rgba(0, 161, 224, 0.35)',
  },
  adobe: {
    primary: '#FF0000',
    light: 'rgba(255, 0, 0, 0.15)',
    dark: 'rgba(255, 0, 0, 0.35)',
  },
};

export function getBrandColors(companyName: string) {
  const id = companyName.toLowerCase().replace(/\s+/g, '');
  return COMPANY_BRAND_COLORS[id] ?? { primary: '#0AFFE4', light: 'rgba(10,255,228,0.15)', dark: 'rgba(10,255,228,0.35)' };
}