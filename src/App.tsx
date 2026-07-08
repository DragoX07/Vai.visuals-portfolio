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
import { auth, signInWithGoogle, logOut, fetchDriveAssets, fetchPortfolioFromFirestore, savePortfolioToFirestore } from './lib/gdrive';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  // Google Drive state
  const [driveUser, setDriveUser] = useState<{ name: string; email: string } | null>(null);
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

  // 1. Fetch public data from Firestore on mount
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const data = await fetchPortfolioFromFirestore();
        if (data) {
          setDrivePhotos(data.photos);
          setDriveVideos(data.videos);
          setDriveShowcaseVideoUrl(data.showcaseVideoUrl);
          setDriveShowcaseThumbnailUrl(data.showcaseThumbnailUrl);
          setDriveSourceInfo(data.sourceInfo);
        }
      } catch (err: any) {
        console.error('Error fetching public portfolio:', err);
      }
    };

    fetchPublicData();
  }, []);

  // 2. Track Admin Auth State
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setDriveUser({
          name: user.displayName || 'Authorized Creator',
          email: user.email || '',
        });
      } else {
        setDriveUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncAdminFromDrive = async (token: string) => {
    console.log('[Sync] Starting sync with token present:', !!token);
    setIsSyncing(true);
    setSyncError(null);
    try {
      console.log('[Sync] Calling fetchDriveAssets...');
      const data = await fetchDriveAssets(token);
      console.log('[Sync] fetchDriveAssets returned:', data ? `Data with ${data.photos?.length || 0} photos and ${data.videos?.length || 0} videos` : 'Null/Undefined data');
      
      console.log('[Sync] Calling savePortfolioToFirestore...');
      await savePortfolioToFirestore(data);
      console.log('[Sync] savePortfolioToFirestore completed successfully');
      
      setDrivePhotos(data.photos);
      setDriveVideos(data.videos);
      setDriveShowcaseVideoUrl(data.showcaseVideoUrl);
      setDriveShowcaseThumbnailUrl(data.showcaseThumbnailUrl);
      setDriveSourceInfo(data.sourceInfo);
      localStorage.setItem('gdrive_oauth_token', token);
      console.log('[Sync] Sync process complete and state updated.');
    } catch (err: any) {
      console.error('[Sync] Failed to sync Google Drive:', err);
      const errorMessage = err.message || '';
      if (errorMessage.toLowerCase().includes('permissions') || errorMessage.toLowerCase().includes('failed to fetch')) {
        setSyncError(`Failed to fetch pictures. Missing or insufficient permissions. Please sign out and sign back in to refresh permissions.`);
      } else {
        setSyncError(`Failed to fetch pictures. ${errorMessage}. Please sign out and sign back in to refresh permissions.`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectDrive = async () => {
    try {
      setSyncError(null);
      const res = await signInWithGoogle();
      if (res) {
        setDriveUser({
          name: res.user.displayName || 'Authorized Creator',
          email: res.user.email || '',
        });
        await syncAdminFromDrive(res.token);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const domain = window.location.hostname;
        setSyncError(`Firebase Error: Please add ${domain} to the "Authorized domains" list in the Firebase Console (Authentication > Settings > Authorized domains).`);
      } else {
        setSyncError(err.message || 'Authentication failed. Please verify setup.');
      }
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await logOut();
      localStorage.removeItem('gdrive_oauth_token');
      setDriveUser(null);
      setSyncError(null);
    } catch (err) {
      console.error(err);
    }
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
      
      {/* 1. Global Navigation Bar */}
      <Header activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* 2. Section 1: Hero collage scene */}
      <HeroSection onPlayShowreel={handlePlayVideo} photos={drivePhotos} showcaseVideoUrl={driveShowcaseVideoUrl} showcaseThumbnailUrl={driveShowcaseThumbnailUrl} onOpenAdminPanel={() => setIsAdminPanelOpen(true)} />

      {/* 3. Section 2: Selected Films dynamic cards */}
      <VideoSection onPlayVideo={handlePlayVideo} videos={driveVideos} />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 flex justify-center opacity-70">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E0D8C8] to-transparent max-w-3xl"></div>
      </div>

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



      {/* 8. Owner Live Studio Integration Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {isAdminPanelOpen && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-cream-dark w-80 max-w-[calc(100vw-2rem)] flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-cream-dark">
              <div>
                <h3 className="font-serif font-bold text-gray-900 text-sm tracking-wide">Studio Sync Center</h3>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Live Portfolio Sync</p>
              </div>
              <button
                onClick={() => setIsAdminPanelOpen(false)}
                className="w-7 h-7 bg-cream hover:bg-cream-dark text-charcoal flex items-center justify-center rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {driveUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-[#FAF5EE] rounded-2xl p-3 border border-[#EBE3D3]">
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-[#2C1A0E] font-bold text-xs">
                    {driveUser.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-serif font-medium text-xs text-charcoal truncate">{driveUser.name}</h4>
                    <p className="text-[9px] font-mono text-[#2C1A0E]/60 truncate">{driveUser.email}</p>
                  </div>
                </div>

                <div className="text-xs font-sans text-charcoal/80 space-y-2 border-t border-[#F2E9D8] pt-3">
                  <div className="flex justify-between">
                    <span>Stills Synced:</span>
                    <strong className="text-terracotta font-mono font-bold">
                      {drivePhotos?.length || 0} / 25
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Videos Synced:</span>
                    <strong className="text-terracotta font-mono font-bold">
                      {driveVideos?.length || 0}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('gdrive_oauth_token');
                      if (token) syncAdminFromDrive(token);
                    }}
                    disabled={isSyncing}
                    className="flex-1 bg-cream hover:bg-cream-dark text-charcoal py-2 rounded-xl text-[10px] font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                  <button
                    onClick={handleDisconnectDrive}
                    className="flex-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 py-2 rounded-xl text-[10px] font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all text-gray-700 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>

                {syncError && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-2xl border border-red-100 font-sans text-[10px]">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <p className="leading-relaxed">{syncError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-650 font-sans tracking-wide leading-relaxed">
                  Creator Login: connect your Google Drive to sync your portfolio files directly to this live website.
                </p>

                {syncError && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-2xl border border-red-100 font-sans text-[10px]">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <p className="leading-relaxed">{syncError}</p>
                  </div>
                )}

                <button
                  onClick={handleConnectDrive}
                  disabled={isSyncing}
                  className="w-full bg-[#C1440E] hover:bg-[#C1440E]/90 text-white py-3.5 rounded-xl text-[11px] font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connect Google Drive</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
