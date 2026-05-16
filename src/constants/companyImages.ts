import Google from '@/assets/images/cards/Google.jpg';
import Microsoft from '@/assets/images/cards/Microsoft.avif';
import Meta from '@/assets/images/cards/Meta.jpg';
import Amazon from '@/assets/images/cards/Amazon.jpg';
import Apple from '@/assets/images/cards/Apple.jpg';
import Netflix from '@/assets/images/cards/Netflix.jpg';
import Tesla from '@/assets/images/cards/Tesla.png';
import Nvidia from '@/assets/images/cards/Nvidia.webp';
import Salesforce from '@/assets/images/cards/Salesforce.jpeg';
import Adobe from '@/assets/images/cards/Adobe.jpeg';

export interface CompanyImageSet {
  main: { src: string; alt: string };
  secondary: [
    { src: string; alt: string; href: string },
    { src: string; alt: string; href: string },
  ];
}

export const COMPANY_IMAGES: Record<string, CompanyImageSet> = {
  google: {
    main: {
      src: Google,
      alt: 'Google campus building',
    },
    secondary: [
      {
        src: 'https://cdn.romania-insider.com/sites/default/files/styles/article_large_image/public/2022-10/new_google_office_bucharest_-_photo_company.jpg',
        alt: 'Tech interview preparation',
        href: 'https://www.techinterviewhandbook.org/',
      },
      {
        src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        alt: 'Google engineering blog',
        href: 'https://developers.googleblog.com/',
      },
    ],
  },
  microsoft: {
    main: {
      src: Microsoft,
      alt: 'Microsoft campus',
    },
    secondary: [
      {
        src: 'https://i.pinimg.com/originals/d2/36/0a/d2360aae550e66b20538ec9ad5ae36ee.jpg',
        alt: 'Interview prep resources',
        href: 'https://pinterest.com/',
      },
      {
        src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
        alt: 'Microsoft engineering blog',
        href: 'https://devblogs.microsoft.com/',
      },
    ],
  },
  meta: {
    main: {
      src: Meta,
      alt: 'Meta headquarters',
    },
    secondary: [
      {
        src: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/e79c46202075555.667f9b7071c08.jpg',
        alt: 'System design preparation',
        href: 'https://www.educative.io/courses/grokking-the-system-design-interview',
      },
      {
        src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
        alt: 'Meta engineering blog',
        href: 'https://engineering.fb.com/',
      },
    ],
  },
  amazon: {
    main: {
      src: Amazon,
      alt: 'Amazon corporate office',
    },
    secondary: [
      {
        src: 'https://officesnapshots.com/wp-content/uploads/2022/10/amazon-offices-singapore-1-1200x800-compact.jpg',
        alt: 'Amazon leadership principles prep',
        href: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
      },
      {
        src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
        alt: 'Amazon engineering blog',
        href: 'https://www.allthingsdistributed.com/',
      },
    ],
  },
  apple: {
    main: {
      src: Apple,
      alt: 'Apple Park campus',
    },
    secondary: [
      {
        src: 'https://mir-s3-cdn-cf.behance.net/project_modules/fs/ac2461112366635.6012f065c2eb5.jpg',
        alt: 'Apple developer resources',
        href: 'https://developer.apple.com/',
      },
      {
        src: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80',
        alt: 'Apple machine learning journal',
        href: 'https://machinelearning.apple.com/',
      },
    ],
  },
  netflix: {
    main: {
      src: Netflix,
      alt: 'Netflix office',
    },
    secondary: [
      {
        src: 'https://jobs.netflix.com/_next/image?url=https:%2F%2F%2F%2Fimages.ctfassets.net%2Fi5wc420v2vd1%2F2GPAtEL5A9HqBsbAP4mGsN%2F8be00441e7c64cb7e283bed8bec3428d%2FNetflix_-_Offices14876_R_R2_p.jpg&w=1080&q=75',
        alt: 'Netflix culture deck',
        href: 'https://jobs.netflix.com/culture',
      },
      {
        src: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80',
        alt: 'Netflix tech blog',
        href: 'https://netflixtechblog.com/',
      },
    ],
  },
  tesla: {
    main: {
      src: Tesla,
      alt: 'Tesla factory',
    },
    secondary: [
      {
        src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/3e8157170728309.6463388fbf1fa.png',
        alt: 'Tesla engineering careers',
        href: 'https://www.tesla.com/careers',
      },
      {
        src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
        alt: 'Tesla AI & robotics',
        href: 'https://www.tesla.com/AI',
      },
    ],
  },
  nvidia: {
    main: {
      src: Nvidia,
      alt: 'NVIDIA headquarters',
    },
    secondary: [
      {
        src: 'https://www.geeky-gadgets.com/wp-content/uploads/2024/03/Inside-NVIDIA-Voyager-Offices.webp',
        alt: 'NVIDIA developer resources',
        href: 'https://developer.nvidia.com/',
      },
      {
        src: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&q=80',
        alt: 'NVIDIA tech blog',
        href: 'https://developer.nvidia.com/blog',
      },
    ],
  },
  salesforce: {
    main: {
      src: Salesforce,
      alt: 'Salesforce Tower',
    },
    secondary: [
      {
        src: 'https://www.salesforce.com/content/dam/blogs/ca/Blog%20Posts/salesforce-brings-the-trailhead-spirit-to-new-vancouver-office-og.png',
        alt: 'Salesforce Trailhead',
        href: 'https://trailhead.salesforce.com/',
      },
      {
        src: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80',
        alt: 'Salesforce engineering blog',
        href: 'https://engineering.salesforce.com/',
      },
    ],
  },
  adobe: {
    main: {
      src: Adobe,
      alt: 'Adobe headquarters',
    },
    secondary: [
      {
        src: 'https://www.officelovin.com/wp-content/uploads/2015/09/adobe-san-francisco-office-2.jpg',
        alt: 'Adobe developer resources',
        href: 'https://developer.adobe.com/',
      },
      {
        src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80',
        alt: 'Adobe tech blog',
        href: 'https://blog.developer.adobe.com/',
      },
    ],
  },
};

export function getCompanyImages(companyName: string): CompanyImageSet | null {
  const id = companyName.toLowerCase().replace(/\s+/g, '');
  return COMPANY_IMAGES[id] ?? null;
}
