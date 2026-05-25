import { StillPhoto, FilmProject } from '../types.js';

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

const appendKey = (url: string, key: string) => {
  return url.includes('?') ? `${url}&key=${key}` : `${url}?key=${key}`;
};

async function findFolderId(apiKey: string, folderName: string, parentId?: string): Promise<string | null> {
  try {
    let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }
    const url = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
    const res = await fetch(url);
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

async function findSubfolders(apiKey: string, parentId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const url = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
  } catch (err) {
    console.error(`Error querying subfolders:`, err);
  }
  return [];
}

async function findSubfolderAlternative(apiKey: string, parentId: string, namePatterns: string[]): Promise<string | null> {
  try {
    const nameQuery = namePatterns.map(p => `name contains '${p.replace(/'/g, "\\'")}'`).join(' or ');
    const query = `mimeType = 'application/vnd.google-apps.folder' and (${nameQuery}) and trashed = false`;
    const url = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const files = data.files || [];
      const match = files.find((f: any) => f.parents && f.parents.includes(parentId));
      if (match) return match.id;

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

export async function fetchDriveAssets(apiKey: string): Promise<DriveData> {
  try {
    let mainFolderId: string | null = null;
    let mainFolderName = 'Website';
    let photosFolderId: string | null = null;
    let videosFolderId: string | null = null;
    let showcaseFolderId: string | null = null;

    const directFolderId = '1EVlj_ZKv3oXBj5QxrpbNCCMD5gwwxY0b';
    try {
      const directFolderUrl = appendKey(`https://www.googleapis.com/drive/v3/files/${directFolderId}?fields=id,name&supportsAllDrives=true`, apiKey);
      const directFolderRes = await fetch(directFolderUrl);
      if (directFolderRes.ok) {
        const folderMeta = await directFolderRes.json();
        mainFolderId = folderMeta.id;
        mainFolderName = folderMeta.name || 'Website';
      }
    } catch (err) {
      console.warn('Could not directly access folder by user-provided ID', err);
    }

    if (!mainFolderId) {
      const queryGlobalFolders = `mimeType = 'application/vnd.google-apps.folder' and (name contains 'Website' or name contains 'website' or name contains 'SSP' or name contains 'ssp') and trashed = false`;
      const urlGlobalFolders = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryGlobalFolders)}&fields=files(id,name)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
      
      const resGlobalFolders = await fetch(urlGlobalFolders);
      if (resGlobalFolders.ok) {
        const data = await resGlobalFolders.json();
        const files = data.files || [];
        const websiteMatches = files.filter((f: any) => f.name.toLowerCase().trim() === 'website');
        if (websiteMatches.length > 0) {
          mainFolderId = websiteMatches[0].id;
          mainFolderName = websiteMatches[0].name;
        } else {
          mainFolderId = files[0]?.id || null;
          mainFolderName = files[0]?.name || 'Not Found';
        }
      }
    }

    if (!mainFolderId) {
      const fallbackNames = ['Website', 'website', 'SSP portfolio', 'SSP Portfolio', 'ssp portfolio'];
      for (const name of fallbackNames) {
        mainFolderId = await findFolderId(apiKey, name);
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

    const subfolders = mainFolderId ? await findSubfolders(apiKey, mainFolderId) : [];
    
    // Attempt logic from subfolders
    if (mainFolderId) {
       photosFolderId = await findSubfolderAlternative(apiKey, mainFolderId, ['photography', 'Photography', 'photos', 'Photos', 'photo', 'Photo']);
       videosFolderId = await findSubfolderAlternative(apiKey, mainFolderId, ['videos', 'Videos', 'video', 'Video', 'final videos', 'final_videos']);
       showcaseFolderId = await findSubfolderAlternative(apiKey, mainFolderId, ['showcase', 'Showcase']);
    }

    if (!photosFolderId) photosFolderId = mainFolderId;
    if (!videosFolderId) videosFolderId = mainFolderId;

    let imgFiles: any[] = [];
    let vidFiles: any[] = [];

    const imgQuery = photosFolderId
      ? `'${photosFolderId}' in parents and mimeType contains 'image/' and trashed = false`
      : "mimeType contains 'image/' and trashed = false";
    const imgUrl = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(imgQuery)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=25&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
    
    try {
      const imgRes = await fetch(imgUrl);
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        const files = imgData.files || [];
        imgFiles = files.map((f: any, index: number) => ({
          ...f,
          category: index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'commercial' : 'editorial'
        }));
      }
    } catch (err) {}

    const vidQuery = videosFolderId
      ? `'${videosFolderId}' in parents and mimeType contains 'video/' and trashed = false`
      : "mimeType contains 'video/' and trashed = false";
    const vidUrl = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(vidQuery)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
    
    try {
      const vidRes = await fetch(vidUrl);
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        vidFiles = vidData.files || [];
      }
    } catch (err) {}

    let showcaseVideoUrl: string | undefined = undefined;
    let showcaseThumbnailUrl: string | undefined = undefined;
    if (showcaseFolderId) {
      const showcaseQuery = `'${showcaseFolderId}' in parents and mimeType contains 'video/' and trashed = false`;
      const showcaseUrl = appendKey(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(showcaseQuery)}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&pageSize=1&supportsAllDrives=true&includeItemsFromAllDrives=true`, apiKey);
      try {
        const res = await fetch(showcaseUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.files && data.files.length > 0) {
            showcaseVideoUrl = data.files[0].webViewLink || data.files[0].webContentLink;
            showcaseThumbnailUrl = data.files[0].thumbnailLink ? data.files[0].thumbnailLink.replace(/=s\d+/, '=s1920') : undefined;
          }
        }
      } catch (err) {}
    }

    imgFiles.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }));
    vidFiles.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }));

    const drivePhotos: StillPhoto[] = imgFiles.map((file: any) => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      category: file.category || 'portrait',
      location: 'Connected Drive Portfolio',
      coverUrl: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1600') : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      originalUrl: file.webViewLink || file.webContentLink
    }));

    const driveVideos: FilmProject[] = vidFiles.map((file: any, index: number) => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      category: 'Cinema Showcase',
      tag: index % 2 === 0 ? 'Documentary' : 'Campaign',
      coverUrl: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1200') : 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
      videoUrl: file.webViewLink || file.webContentLink
    }));

    return {
      photos: drivePhotos,
      videos: driveVideos,
      showcaseVideoUrl,
      showcaseThumbnailUrl,
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
