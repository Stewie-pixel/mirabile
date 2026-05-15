export interface HiringStat {
  text: string;
  source: string;
  sourceUrl: string;
}

export const COMPANY_HIRING_STATS: Record<string, HiringStat> = {
  google: {
    text: 'Google receives over 3 million applications per year but hires roughly 7,000 — a selectivity rate lower than Harvard\'s.',
    source: 'Business Insider, Alphabet Annual Reports',
    sourceUrl: 'https://www.businessinsider.com/how-hard-it-is-to-get-a-job-at-google-2023',
  },
  microsoft: {
    text: 'Microsoft employs over 228,000 people globally and receives approximately 2 million job applications annually.',
    source: 'Microsoft Annual Report 2025',
    sourceUrl: 'https://www.microsoft.com/en-us/investor/annual-reports.aspx',
  },
  meta: {
    text: 'Meta receives over 1 million applications per year for roughly 3,000–5,000 engineering positions, with an acceptance rate below 1%.',
    source: 'CNBC, Meta Investor Relations',
    sourceUrl: 'https://investor.fb.com/financial-releases/default.aspx',
  },
  amazon: {
    text: 'Amazon is one of the world\'s largest employers with over 1.5 million employees, and receives millions of applications annually across all divisions.',
    source: 'Amazon 2024 Annual Report',
    sourceUrl: 'https://ir.aboutamazon.com/annual-reports-proxies-and-shareholder-letters/default.aspx',
  },
  apple: {
    text: 'Apple employs over 164,000 full-time staff and is known for its rigorous multi-round interview process, often lasting 6–8 weeks.',
    source: 'Apple 10-K Filing 2024',
    sourceUrl: 'https://investor.apple.com/sec-filings/default.aspx',
  },
  netflix: {
    text: 'Netflix employs around 13,000 people and is famous for its "keeper test" culture — managers regularly ask whether they would fight to keep each team member.',
    source: 'Netflix Culture Page, SEC Filings',
    sourceUrl: 'https://jobs.netflix.com/culture',
  },
  tesla: {
    text: 'Tesla receives hundreds of thousands of applications annually for around 130,000 positions across manufacturing, engineering, and AI.',
    source: 'Tesla Annual Report 2024',
    sourceUrl: 'https://ir.tesla.com/sec-filings/annual-reports',
  },
  nvidia: {
    text: 'NVIDIA has grown to over 29,600 employees and saw a 265% stock surge in 2023, making it one of the most sought-after tech employers globally.',
    source: 'NVIDIA 2024 Annual Report',
    sourceUrl: 'https://investor.nvidia.com/financial-info/sec-filings/default.aspx',
  },
  salesforce: {
    text: 'Salesforce employs over 72,000 people and has been ranked as one of the best workplaces by Fortune for 14 consecutive years.',
    source: 'Salesforce Annual Report 2024, Fortune Best Workplaces',
    sourceUrl: 'https://investor.salesforce.com/financial-information/annual-reports',
  },
  adobe: {
    text: 'Adobe employs over 30,000 people worldwide and consistently ranks in the top 20 of Glassdoor\'s Best Places to Work.',
    source: 'Adobe FY2024 Annual Report, Glassdoor',
    sourceUrl: 'https://www.adobe.com/investor-relations.html',
  },
};

export function getHiringStat(companyName: string): HiringStat | null {
  const id = companyName.toLowerCase().replace(/\s+/g, '');
  return COMPANY_HIRING_STATS[id] ?? null;
}
