/**
 * Types & Interfaces for vai.visuals Portfolio
 */

export interface FloatingPhoto {
  id: string;
  url: string;
  alt: string;
  top: string;
  left?: string;
  right?: string;
  rotation: number;
  size: string; // Tailwinds class e.g. "w-32 md:w-56"
  speedFactor: number; // For parallax drifting depth
  category: 'portrait' | 'commercial' | 'editorial';
}

export interface FilmProject {
  id: string;
  title: string;
  category: string;
  tag: 'Brand Film' | 'Documentary' | 'Commercial' | 'Campaign' | 'Art Short';
  coverUrl: string;
  videoUrl: string; // HTML5 direct streaming MP4
}

export interface StillPhoto {
  id: string;
  title: string;
  category: 'portrait' | 'commercial' | 'editorial';
  location: string;
  coverUrl: string;
  originalUrl?: string;
}

export interface EnquiryForm {
  name: string;
  email: string;
  projectType: string;
  budget?: string;
  message: string;
}
