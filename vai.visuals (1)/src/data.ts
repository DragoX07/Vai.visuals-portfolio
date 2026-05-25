import { FloatingPhoto, FilmProject, StillPhoto } from './types';

// Floating photos arrangement around the central hero showreel
export const floatingHeroPhotos: FloatingPhoto[] = [
  {
    id: 'hero-1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    alt: 'Modernist architecture shadow play',
    top: '8%',
    left: '5%',
    rotation: -6,
    size: 'w-24 sm:w-36 md:w-48 lg:w-56',
    speedFactor: 0.08,
    category: 'editorial'
  },
  {
    id: 'hero-2',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    alt: 'High-fashion portrait in warm tone',
    top: '12%',
    right: '8%',
    rotation: 5,
    size: 'w-28 sm:w-40 md:w-52 lg:w-60',
    speedFactor: 0.04,
    category: 'portrait'
  },
  {
    id: 'hero-3',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    alt: 'Minimalist beige interior with shafts of afternoon sunlight',
    top: '46%',
    left: '4%',
    rotation: -8,
    size: 'w-20 sm:w-32 md:w-40 lg:w-48',
    speedFactor: 0.12,
    category: 'commercial'
  },
  {
    id: 'hero-4',
    url: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=600&q=80',
    alt: 'Terracotta masonry shadow cast',
    top: '76%',
    left: '8%',
    rotation: 4,
    size: 'w-28 sm:w-36 md:w-48 lg:w-56',
    speedFactor: 0.07,
    category: 'commercial'
  },
  {
    id: 'hero-5',
    url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=600&q=80',
    alt: 'Warm wheat field earthy atmosphere',
    top: '78%',
    right: '6%',
    rotation: -5,
    size: 'w-24 sm:w-36 md:w-48 lg:w-52',
    speedFactor: 0.10,
    category: 'editorial'
  },
  {
    id: 'hero-6',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    alt: 'Expressive model portrait',
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
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    alt: 'Earthy design collab and shadows',
    top: '3%',
    left: '42%',
    rotation: -2,
    size: 'w-22 sm:w-32 md:w-40 lg:w-44',
    speedFactor: 0.06,
    category: 'commercial'
  },
  {
    id: 'hero-8',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    alt: 'Golden hour sand drift',
    top: '84%',
    left: '44%',
    rotation: 3,
    size: 'w-24 sm:w-36 md:w-44 lg:w-48',
    speedFactor: 0.09,
    category: 'editorial'
  }
];

// Content for Section 2: Videos (Works/Films)
export const filmProjects: FilmProject[] = [
  {
    id: 'film-1',
    title: 'The Quiet Craftsman',
    category: 'Documentary',
    tag: 'Documentary',
    coverUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://player.vimeo.com/external/459389137.hd.mp4?s=878dcd1e0fd11357b98bf9dc7edef40fa8be8c4c&profile_id=170&oauth2_token_id=57447761'
  },
  {
    id: 'film-2',
    title: 'Echoes of Clay',
    category: 'Brand Campaign',
    tag: 'Brand Film',
    coverUrl: 'https://images.unsplash.com/photo-1565192647048-f997ded87958?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://player.vimeo.com/external/435674703.hd.mp4?s=6f41161d1bc63a48e71887e14f9d1e57c6b24508&profile_id=170&oauth2_token_id=57447761'
  },
  {
    id: 'film-3',
    title: 'Acre & Bloom',
    category: 'Sartorial Commercial',
    tag: 'Commercial',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://player.vimeo.com/external/403848135.hd.mp4?s=d00e0b3c66bf631fc6121f1a5405bd0c184ac4e8&profile_id=170&oauth2_token_id=57447761'
  },
  {
    id: 'film-4',
    title: 'Solitude in Concrete',
    category: 'Architectural Monologue',
    tag: 'Art Short',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://player.vimeo.com/external/449174578.hd.mp4?s=8c34ee17efc8fcb0aaba5eb683e96191b7d79b94&profile_id=170&oauth2_token_id=57447761'
  }
];

// Content for Section 3: Stills (Photos lookbook)
export const stillsPhotos: StillPhoto[] = [
  {
    id: 'still-1',
    title: 'Sunbeams on Plaster',
    category: 'commercial',
    location: 'Marrakesh, MA',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-2',
    title: 'Linnea in Saffron',
    category: 'portrait',
    location: 'Stockholm, SE',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-3',
    title: 'Desert Drapery Study',
    category: 'editorial',
    location: 'Mojave Desert, CA',
    coverUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-4',
    title: 'Terracotta Vessels VII',
    category: 'commercial',
    location: 'Tuscany, IT',
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-5',
    title: 'Linen and Shadows',
    category: 'editorial',
    location: 'Amalfi Coast, IT',
    coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-6',
    title: 'Hands of the Botanist',
    category: 'portrait',
    location: 'Oaxaca, MX',
    coverUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-7',
    title: 'Warm Clay Shadows',
    category: 'commercial',
    location: 'Nantes, FR',
    coverUrl: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-8',
    title: 'Chiaroscuro Silhouette',
    category: 'editorial',
    location: 'Noto, IT',
    coverUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'still-9',
    title: 'The Alchemist Portrait',
    category: 'portrait',
    location: 'Fez, MA',
    coverUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80'
  }
];
