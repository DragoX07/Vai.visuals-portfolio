import { FloatingPhoto, FilmProject, StillPhoto } from './types';

// Floating photos arrangement around the central hero showreel
export const floatingHeroPhotos: FloatingPhoto[] = [
  {
    id: 'hero-1',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '8%',
    left: '5%',
    rotation: -6,
    size: 'w-24 sm:w-36 md:w-48 lg:w-56',
    speedFactor: 0.08,
    category: 'editorial'
  },
  {
    id: 'hero-2',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '12%',
    right: '8%',
    rotation: 5,
    size: 'w-28 sm:w-40 md:w-52 lg:w-60',
    speedFactor: 0.04,
    category: 'portrait'
  },
  {
    id: 'hero-3',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '46%',
    left: '4%',
    rotation: -8,
    size: 'w-20 sm:w-32 md:w-40 lg:w-48',
    speedFactor: 0.12,
    category: 'commercial'
  },
  {
    id: 'hero-4',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '76%',
    left: '8%',
    rotation: 4,
    size: 'w-28 sm:w-36 md:w-48 lg:w-56',
    speedFactor: 0.07,
    category: 'commercial'
  },
  {
    id: 'hero-5',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '78%',
    right: '6%',
    rotation: -5,
    size: 'w-24 sm:w-36 md:w-48 lg:w-52',
    speedFactor: 0.10,
    category: 'editorial'
  },
  {
    id: 'hero-6',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '44%',
    right: '3%',
    rotation: 7,
    size: 'w-26 sm:w-36 md:w-44 lg:w-52',
    speedFactor: 0.05,
    category: 'portrait'
  },
  // Top center and bottom center to float elegantly behind/overlapping vertical layouts
  {
    id: 'hero-7',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '3%',
    left: '42%',
    rotation: -2,
    size: 'w-22 sm:w-32 md:w-40 lg:w-44',
    speedFactor: 0.06,
    category: 'commercial'
  },
  {
    id: 'hero-8',
    url: '',
    alt: 'Dynamic gallery placeholder',
    top: '84%',
    left: '44%',
    rotation: 3,
    size: 'w-24 sm:w-36 md:w-44 lg:w-48',
    speedFactor: 0.09,
    category: 'editorial'
  }
];

// Content for Section 2: Videos (Works/Films)
export const filmProjects: FilmProject[] = [];

// Content for Section 3: Stills (Photos lookbook)
export const stillsPhotos: StillPhoto[] = [];
