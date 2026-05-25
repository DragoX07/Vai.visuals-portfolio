import { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import VideoSection from './components/VideoSection';
import PhotoSection from './components/PhotoSection';
import EnquirySection from './components/EnquirySection';
import Footer from './components/Footer';
import LightboxModal from './components/LightboxModal';
import { StillPhoto, FilmProject } from './types';
import { Camera, LogIn, LogOut, RefreshCw, X, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  
  // Google Drive state
  const [drivePhotos, setDrivePhotos] = useState<StillPhoto[] | undefined>(undefined);
  const [driveVideos, setDriveVideos] = useState<FilmProject[] | undefined>(undefined);
  const [driveShowcaseVideoUrl, setDriveShowcaseVideoUrl] = useState<string | undefined>(undefined);
  const [driveShowcaseThumbnailUrl, setDriveShowcaseThumbnailUrl] = useState<string | undefined>(undefined);
  const [driveSourceInfo, setDriveSourceInfo] = useState<{
    mainFolderFound: boolean;
    mainFolderName: string;
    photosFolderFound: boolean;
    videosFolderFound: boolean;
  } | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Lightbox modal tracker state
  const [lightboxState, setLightboxState] = useState<{
    videoUrl: string | null;
    imageUrl: string | null;
    imageTitle?: string;
    imageLocation?: string;
    originalUrl?: string;
  }>({
    videoUrl: null,
    imageUrl: null,
  });

  // Remove Firebase Auth tracking and use a simple fetch on mount
  useEffect(() => {
    const fetchAssets = async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const res = await fetch('/api/drive/assets');
        if (!res.ok) {
          try {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch from API');
          } catch (e) {
            throw new Error(`Failed to fetch from API: HTTP ${res.status}`);
          }
        }
        const data = await res.json();
        setDrivePhotos(data.photos);
        setDriveVideos(data.videos);
        setDriveShowcaseVideoUrl(data.showcaseVideoUrl);
        setDriveShowcaseThumbnailUrl(data.showcaseThumbnailUrl);
        setDriveSourceInfo(data.sourceInfo);
      } catch (err: any) {
        console.error('Failed to fetch global drive assets:', err);
        setSyncError('Could not load portfolio content. Ensure the folder is public and your GOOGLE_API_KEY is configured.');
      } finally {
        setIsSyncing(false);
      }
    };
    fetchAssets();
  }, []);

  const handleConnectDrive = async () => {
    // Legacy function, no-op since it's now public
  };

  const handleDisconnectDrive = async () => {
    // Legacy function
  };

  // Track active scrolls using IntersectionObserver API
  useEffect(() => {
    const sections = ['home', 'video', 'photos', 'enquiry'];
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-35% 0px -45% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Lightbox overlay toggles
  const handlePlayVideo = (videoUrl: string) => {
    setLightboxState({
      videoUrl,
      imageUrl: null,
    });
  };

  const handleZoomPhoto = (imageUrl: string, title?: string, location?: string, originalUrl?: string) => {
    setLightboxState({
      videoUrl: null,
      imageUrl,
      imageTitle: title,
      imageLocation: location,
      originalUrl,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState({
      videoUrl: null,
      imageUrl: null,
    });
  };

  return (
    <div id="vai-visuals-root" className="min-h-screen bg-cream text-charcoal select-text relative antialiased pb-12 sm:pb-0">
      {syncError && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-red-100 border-b border-red-200 px-4 py-3 text-red-800 flex items-center justify-center gap-3 text-sm font-medium shadow-sm">
          <span>⚠️ {syncError}</span>
        </div>
      )}
      
      {/* 1. Global Navigation Bar */}
      <Header activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* 2. Section 1: Hero collage scene */}
      <HeroSection onPlayShowreel={handlePlayVideo} photos={drivePhotos} showcaseVideoUrl={driveShowcaseVideoUrl} showcaseThumbnailUrl={driveShowcaseThumbnailUrl} />

      {/* 3. Section 2: Selected Films dynamic cards */}
      <VideoSection onPlayVideo={handlePlayVideo} videos={driveVideos} />

      {/* 4. Section 3: Fine-Art photography Lookbook */}
      <PhotoSection onZoomPhoto={handleZoomPhoto} photos={drivePhotos} />

      {/* 5. Section 4: Enquiry Contact suite & details */}
      <EnquirySection />

      {/* 6. Global Editorial Footer */}
      <Footer />

      {/* 7. Shared Lightbox (Video Player + Image Zoom slideshow) */}
      <LightboxModal
        videoUrl={lightboxState.videoUrl}
        imageUrl={lightboxState.imageUrl}
        imageTitle={lightboxState.imageTitle}
        imageLocation={lightboxState.imageLocation}
        originalUrl={lightboxState.originalUrl}
        onClose={handleCloseLightbox}
      />



    </div>
  );
}
