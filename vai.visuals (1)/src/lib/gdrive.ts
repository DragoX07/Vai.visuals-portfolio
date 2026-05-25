import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StillPhoto, FilmProject } from '../types';

// Initialize Firebase with safety checks for placeholder values
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'placeholder';

let app;
let auth: any = null;
let db: any = null;
if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

const provider = new GoogleAuthProvider();
// Required Google Drive scope to browse and read metadata of files
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export { auth, provider, db };

export interface DriveData {
  photos: StillPhoto[];
  videos: FilmProject[];
  showcaseVideoUrl?: string;
  showcaseThumbnailUrl?: string;
  sourceInfo?: {
    mainFolderFound: boolean;
    mainFolderName: string;
    photosFolderFound: boolean;
    videosFolderFound: boolean;
  };
}

export async function savePortfolioToFirestore(data: DriveData): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  // Clone and drop all nested undefined values cleanly so Firestore never crashes
  const strippedData = JSON.parse(JSON.stringify(data));
  const cleanData = {
    ...strippedData,
    showcaseVideoUrl: strippedData.showcaseVideoUrl ?? null,
    showcaseThumbnailUrl: strippedData.showcaseThumbnailUrl ?? null,
    sourceInfo: strippedData.sourceInfo ?? null
  };
  await setDoc(doc(db, 'portfolio', 'main'), cleanData);
}

export async function fetchPortfolioFromFirestore(): Promise<DriveData | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'portfolio', 'main'));
    if (snap.exists()) {
      return snap.data() as DriveData;
    }
  } catch (err: any) {
    if (err.message?.includes('offline')) {
      console.warn('Firestore is offline or unreachable. Will fallback to alternative data source if available.');
      throw err; // throw so App.tsx can catch it
    }
    console.error('Error in fetchPortfolioFromFirestore:', err);
    throw err;
  }
  return null;
}

/**
 * Perform Google Sign-In and return User + Token
 */
export async function signInWithGoogle(): Promise<{ user: User; token: string } | null> {
  if (!auth) {
    throw new Error('Firebase is not yet configured with real credentials. Please accept the OAuth workspace permissions first.');
  }
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    if (!token) {
      throw new Error('No access token returned from Google authentication.');
    }
    
    return {
      user: result.user,
      token,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Log out from session
 */
export async function logOut(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Helper to fetch a folder ID by name and optional parentId
 */
async function findFolderId(token: string, folderName: string, parentId?: string): Promise<string | null> {
  try {
    let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        if (parentId) {
          const match = data.files.find((f: any) => f.parents && f.parents.includes(parentId));
          if (match) return match.id;
        }
        return data.files[0].id;
      }
    }
  } catch (err) {
    console.error(`Error finding folder ${folderName}:`, err);
  }
  return null;
}

/**
 * Fuzzy search to be extra robust
 */
async function findFolderIdFuzzy(token: string, folderNamePatterns: string[], parentId?: string): Promise<string | null> {
  try {
    for (const pattern of folderNamePatterns) {
      let query = `mimeType = 'application/vnd.google-apps.folder' and name contains '${pattern.replace(/'/g, "\\'")}' and trashed = false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          if (parentId) {
            const match = data.files.find((f: any) => f.parents && f.parents.includes(parentId));
            if (match) return match.id;
          }
          return data.files[0].id;
        }
      }
    }
  } catch (err) {
    console.error(`Error fuzzy searching folder with patterns [${folderNamePatterns.join(', ')}]:`, err);
  }
  return null;
}

/**
 * Helper to fetch subfolders of a specific parent folder
 */
async function findSubfolders(token: string, parentId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
  } catch (err) {
    console.error(`Error querying subfolders:`, err);
  }
  return [];
}

/**
 * Alternative subfolder search checking parent ID references
 */
async function findSubfolderAlternative(token: string, parentId: string, namePatterns: string[]): Promise<string | null> {
  try {
    const nameQuery = namePatterns.map(p => `name contains '${p.replace(/'/g, "\\'")}'`).join(' or ');
    const query = `mimeType = 'application/vnd.google-apps.folder' and (${nameQuery}) and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      const files = data.files || [];
      // Look for a folder that lists parentId as parent
      const match = files.find((f: any) => f.parents && f.parents.includes(parentId));
      if (match) return match.id;

      // Unnested fallback: Look for a matched name
      const exactMatch = files.find((f: any) => {
        const name = f.name.toLowerCase().trim();
        return namePatterns.map(p => p.toLowerCase()).includes(name);
      });
      if (exactMatch) return exactMatch.id;
    }
  } catch (err) {
    console.error('Error in findSubfolderAlternative:', err);
  }
  return null;
}

/**
 * Fetch 25 images and videos from Google Drive
 */
export async function fetchDriveAssets(token: string): Promise<DriveData> {
  try {
    console.log('[fetchDriveAssets] Starting with token', token ? 'present' : 'missing');
    let mainFolderId: string | null = null;
    let mainFolderName = 'Website';
    let photosFolderId: string | null = null;
    let videosFolderId: string | null = null;
    let showcaseFolderId: string | null = null;

    // 1. Determine the "Website" folder ID from Drive (or fallback to 'SSP portfolio')
    // First, try the user's specific folder ID provided in the resource link
    const directFolderId = '1EVlj_ZKv3oXBj5QxrpbNCCMD5gwwxY0b';
    try {
      console.log('[fetchDriveAssets] Attempting to access direct folder ID:', directFolderId);
      const directFolderUrl = `https://www.googleapis.com/drive/v3/files/${directFolderId}?fields=id,name&supportsAllDrives=true`;
      const directFolderRes = await fetch(directFolderUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (directFolderRes.ok) {
        const folderMeta = await directFolderRes.json();
        mainFolderId = folderMeta.id;
        mainFolderName = folderMeta.name || 'Website';
        console.log('[fetchDriveAssets] Successfully accessed direct folder:', mainFolderId, mainFolderName);
      } else {
        console.log('[fetchDriveAssets] Direct folder fetch failed with status:', directFolderRes.status, await directFolderRes.text().catch(()=>''));
      }
    } catch (err) {
      console.warn('Could not directly access folder by user-provided ID, falling back to name search:', err);
    }

    // Fallback to searching folders by name in Drive if the direct ID wasn't accessible or successful
    if (!mainFolderId) {
      const queryGlobalFolders = `mimeType = 'application/vnd.google-apps.folder' and (name contains 'Website' or name contains 'website' or name contains 'SSP' or name contains 'ssp') and trashed = false`;
      const urlGlobalFolders = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryGlobalFolders)}&fields=files(id,name)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`;
      
      const resGlobalFolders = await fetch(urlGlobalFolders, { headers: { Authorization: `Bearer ${token}` } });
      if (resGlobalFolders.ok) {
        const data = await resGlobalFolders.json();
        const files = data.files || [];
        console.log(`[fetchDriveAssets] Found ${files.length} folders globally matching query.`);
        
        // Attempt 1: Exact match for 'Website'
        const websiteMatches = files.filter((f: any) => f.name.toLowerCase().trim() === 'website');
        if (websiteMatches.length > 0) {
          mainFolderId = websiteMatches[0].id;
          mainFolderName = websiteMatches[0].name;
          console.log('[fetchDriveAssets] Matched exact "Website" folder:', mainFolderId);
        } else {
          // Attempt 2: Exact match for 'SSP portfolio' or similar
          const sspMatches = files.filter((f: any) => {
            const nm = f.name.toLowerCase().trim();
            return nm === 'ssp portfolio' || nm === 'ssp_portfolio' || nm === 'ssp-portfolio';
          });
          if (sspMatches.length > 0) {
            mainFolderId = sspMatches[0].id;
            mainFolderName = sspMatches[0].name;
            console.log('[fetchDriveAssets] Matched exact "SSP folder":', mainFolderId);
          } else {
            // Attempt 3: Fuzzy match containing 'website'
            const fuzzyWebsite = files.find((f: any) => f.name.toLowerCase().includes('website'));
            if (fuzzyWebsite) {
              mainFolderId = fuzzyWebsite.id;
              mainFolderName = fuzzyWebsite.name;
            } else {
              // Attempt 4: Fuzzy match containing 'ssp'
              const fuzzySSP = files.find((f: any) => f.name.toLowerCase().includes('ssp'));
              if (fuzzySSP) {
                mainFolderId = fuzzySSP.id;
                mainFolderName = fuzzySSP.name;
              } else if (files.length > 0) {
                // Attempt 5: Fallback to any folder matching either
                mainFolderId = files[0].id;
                mainFolderName = files[0].name;
              }
            }
          }
        }
      }
    }

    // Try absolute lookup by name if containing query was empty
    if (!mainFolderId) {
      const fallbackNames = ['Website', 'website', 'SSP portfolio', 'SSP Portfolio', 'ssp portfolio'];
      for (const name of fallbackNames) {
        mainFolderId = await findFolderId(token, name);
        if (mainFolderId) {
          mainFolderName = name;
          break;
        }
      }
    }

    let mainFolderFound = true;
    if (!mainFolderId) {
      mainFolderFound = false;
      mainFolderName = 'Not Found';
    }

    // 2. Fetch subfolders inside our resolved main folder if found
    const subfolders = mainFolderId ? await findSubfolders(token, mainFolderId) : [];
    
    const isWebsiteStructure = mainFolderName.toLowerCase().includes('website') || !mainFolderFound;

    if (mainFolderId) {
      if (isWebsiteStructure) {
        // Look for "Photography"
        const photosSub = subfolders.find((f: any) => {
          const name = f.name.toLowerCase().trim();
          return name === 'photography' || name === 'photos' || name === 'photo';
        });
        if (photosSub) {
          photosFolderId = photosSub.id;
        } else {
          photosFolderId = await findSubfolderAlternative(token, mainFolderId, ['photography', 'Photography', 'photos', 'Photos', 'photo', 'Photo']);
        }

        // Look for "videos"
        const videosSub = subfolders.find((f: any) => {
          const name = f.name.toLowerCase().trim();
          return name === 'videos' || name === 'video' || name === 'final videos' || name === 'final_videos';
        });
        if (videosSub) {
          videosFolderId = videosSub.id;
        } else {
          videosFolderId = await findSubfolderAlternative(token, mainFolderId, ['videos', 'Videos', 'video', 'Video', 'final videos', 'final_videos']);
        }

        // Look for "showcase"
        const showcaseSub = subfolders.find((f: any) => {
          const name = f.name.toLowerCase().trim();
          return name === 'showcase';
        });
        if (showcaseSub) {
          showcaseFolderId = showcaseSub.id;
        } else {
          showcaseFolderId = await findSubfolderAlternative(token, mainFolderId, ['showcase', 'Showcase']);
        }
      } else {
        // Look for "photos" inside SSP
        const photosSub = subfolders.find((f: any) => {
          const name = f.name.toLowerCase().trim();
          return name === 'photos' || name === 'photo' || name === 'photography';
        });
        if (photosSub) {
          photosFolderId = photosSub.id;
        } else {
          photosFolderId = await findSubfolderAlternative(token, mainFolderId, ['photos', 'photo', 'Photos', 'Photo', 'photography', 'Photography']);
        }

        // Look for "final videos" inside SSP
        const videosSub = subfolders.find((f: any) => {
          const name = f.name.toLowerCase().trim();
          return name === 'final videos' || name === 'final_videos' || name === 'videos' || name === 'video';
        });
        if (videosSub) {
          videosFolderId = videosSub.id;
        } else {
          videosFolderId = await findSubfolderAlternative(token, mainFolderId, ['final videos', 'final_videos', 'videos', 'video', 'final video', 'Final Videos', 'Videos']);
        }

        // Look for "showcase"
        const showcaseSub = subfolders.find((f: any) => {
          const name = f.name.toLowerCase().trim();
          return name === 'showcase';
        });
        if (showcaseSub) {
          showcaseFolderId = showcaseSub.id;
        } else {
          showcaseFolderId = await findSubfolderAlternative(token, mainFolderId, ['showcase', 'Showcase']);
        }
      }
    }

    // 3. Fallback globally if not found within the specific tree
    if (!photosFolderId) {
      photosFolderId = await findFolderId(token, isWebsiteStructure ? 'Photography' : 'photos');
      if (!photosFolderId) photosFolderId = await findFolderId(token, isWebsiteStructure ? 'photography' : 'Photos');
      if (!photosFolderId) photosFolderId = await findFolderIdFuzzy(token, isWebsiteStructure ? ['photography', 'Photography'] : ['photos', 'Photos', 'photo']);
    }

    if (!videosFolderId) {
      videosFolderId = await findFolderId(token, isWebsiteStructure ? 'videos' : 'final videos');
      if (!videosFolderId) videosFolderId = await findFolderId(token, isWebsiteStructure ? 'Videos' : 'Final Videos');
      if (!videosFolderId) videosFolderId = await findFolderIdFuzzy(token, isWebsiteStructure ? ['videos', 'Videos'] : ['final video', 'final videos', 'videos']);
    }

    // 4. Ultimate Fallback: if those subfolders can't be resolved, use mainFolderId directly
    if (!photosFolderId) {
      photosFolderId = mainFolderId;
    }
    if (!videosFolderId) {
      videosFolderId = mainFolderId;
    }

    let imgFiles: any[] = [];
    let vidFiles: any[] = [];

    // Organize photos into categories based on subfolders ("portrait", "editorial", "commercial")
    let foundSubfolderPhotos = false;
    let categorySubfolders: any[] = [];
    if (photosFolderId) {
      categorySubfolders = await findSubfolders(token, photosFolderId);
    }

    const subfoldersWithCategory = categorySubfolders.filter((f: any) => {
      const nm = f.name.toLowerCase().trim();
      return nm.includes('portrait') || nm.includes('editorial') || nm.includes('commercial');
    });

    if (subfoldersWithCategory.length > 0) {
      try {
        const results = await Promise.all(
          subfoldersWithCategory.map(async (folder: any) => {
            const nm = folder.name.toLowerCase().trim();
            let cat: 'portrait' | 'editorial' | 'commercial' = 'portrait';
            if (nm.includes('editorial')) cat = 'editorial';
            else if (nm.includes('commercial')) cat = 'commercial';

            const q = `'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`;
            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=25&supportsAllDrives=true&includeItemsFromAllDrives=true`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const d = await res.json();
              const files = d.files || [];
              return files.map((f: any) => ({
                ...f,
                category: cat
              }));
            }
            return [];
          })
        );

        // Flatten all gathered images from folder categories
        const flattened = results.reduce((acc, val) => acc.concat(val), []);
        if (flattened.length > 0) {
          imgFiles = flattened;
          foundSubfolderPhotos = true;
        }
      } catch (err) {
        console.error('Error fetching categorized subfolder photos:', err);
      }
    }

    console.log('[fetchDriveAssets] Photos folder resolved to:', photosFolderId);
    console.log('[fetchDriveAssets] Videos folder resolved to:', videosFolderId);

    // Fallback: Query direct child files in photosFolderId itself if subfolders are empty or missing, or query globally from entire Drive
    if (!foundSubfolderPhotos) {
      const imgQuery = photosFolderId
        ? `'${photosFolderId}' in parents and mimeType contains 'image/' and trashed = false`
        : "mimeType contains 'image/' and trashed = false";
      const imgUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(imgQuery)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=25&supportsAllDrives=true&includeItemsFromAllDrives=true`;
      try {
        console.log('[fetchDriveAssets] Fetching direct images with query:', imgQuery);
        const imgRes = await fetch(imgUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const files = imgData.files || [];
          console.log(`[fetchDriveAssets] Found ${files.length} images directly`);
          imgFiles = files.map((f: any, index: number) => ({
            ...f,
            category: index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'commercial' : 'editorial'
          }));
        } else {
          console.log('[fetchDriveAssets] Direct images fetch failed:', imgRes.status, await imgRes.text().catch(()=>''));
        }
      } catch (err) {
        console.error('[fetchDriveAssets] Error fetching direct/global images:', err);
      }
    }


    // Query videos safely with supportsAllDrives (fallback to global video query if videosFolderId is null)
    const vidQuery = videosFolderId
      ? `'${videosFolderId}' in parents and mimeType contains 'video/' and trashed = false`
      : "mimeType contains 'video/' and trashed = false";
    const vidUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(vidQuery)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`;
    try {
      const vidRes = await fetch(vidUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        vidFiles = vidData.files || [];
      }
    } catch (err) {
      console.error('Error fetching direct/global videos:', err);
    }

    let showcaseVideoUrl: string | undefined = undefined;
    let showcaseThumbnailUrl: string | undefined = undefined;
    if (showcaseFolderId) {
      const showcaseQuery = `'${showcaseFolderId}' in parents and mimeType contains 'video/' and trashed = false`;
      const showcaseUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(showcaseQuery)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=1&supportsAllDrives=true&includeItemsFromAllDrives=true`;
      try {
        const res = await fetch(showcaseUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data.files && data.files.length > 0) {
            showcaseVideoUrl = data.files[0].webViewLink || data.files[0].webContentLink;
            // Get larger thumbnail by removing width limit
            showcaseThumbnailUrl = data.files[0].thumbnailLink ? data.files[0].thumbnailLink.replace(/=s\d+/, '=s1920') : undefined;
          }
        }
      } catch (err) {
        console.error('Error fetching showcase video:', err);
      }
    }

    // Sort files naturally by name (so 1 starts before 2, etc. up to 8)
    imgFiles.sort((a: any, b: any) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    vidFiles.sort((a: any, b: any) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    const drivePhotos: StillPhoto[] = imgFiles.map((file: any) => {
      const hqThumbnail = file.thumbnailLink 
        ? file.thumbnailLink.replace(/=s\d+/, '=s1600')
        : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';

      return {
        id: file.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // Strip file extension
        category: file.category || 'portrait',
        location: 'Connected Drive Portfolio',
        coverUrl: hqThumbnail,
        originalUrl: file.webViewLink || file.webContentLink || null
      };
    });

    const driveVideos: FilmProject[] = vidFiles.map((file: any, index: number) => {
      const hqThumbnail = file.thumbnailLink 
        ? file.thumbnailLink.replace(/=s\d+/, '=s1200')
        : 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80';

      return {
        id: file.id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: 'Cinema Showcase',
        tag: index % 2 === 0 ? 'Documentary' : 'Campaign',
        coverUrl: hqThumbnail,
        videoUrl: file.webViewLink || file.webContentLink || null // Stream / link via Drive directly
      };
    });

    return {
      photos: drivePhotos,
      videos: driveVideos,
      showcaseVideoUrl: showcaseVideoUrl ?? null,
      showcaseThumbnailUrl: showcaseThumbnailUrl ?? null,
      sourceInfo: {
        mainFolderFound: !!mainFolderId,
        mainFolderName: mainFolderName,
        photosFolderFound: !!photosFolderId && photosFolderId !== mainFolderId,
        videosFolderFound: !!videosFolderId && videosFolderId !== mainFolderId
      }
    };
  } catch (error) {
    console.error('Error fetching specified folders from Google Drive:', error);
    throw error;
  }
}
