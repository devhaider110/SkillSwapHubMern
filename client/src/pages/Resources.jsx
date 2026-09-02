import { useEffect, useState } from 'react';
import {
  Upload,
  File,
  Image as ImageIcon,
  FileText,
  Download,
  Pin,
  Trash2,
  ExternalLink,
  RefreshCw,
  Video,
  Archive,
  Folder,
  FolderPlus,
  Move,
  X,
  Search,
  Eye,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import {
  getResources,
  uploadResource,
  deleteResource,
  updateResource,
  downloadResource,
  getFolders,
  createFolder,
  deleteFolder,
} from '../services/api';

// ============================================================
// URL HELPERS
// ============================================================

const normalizeFileUrl = (url) => {
  if (!url) return '';
  let cleanUrl = String(url).trim().replace(/\s+/g, '');
  cleanUrl = cleanUrl.replace(/^https\/\//i, 'https://');
  cleanUrl = cleanUrl.replace(/^http\/\//i, 'http://');
  cleanUrl = cleanUrl.replace(/^https:\/{3,}/i, 'https://');
  cleanUrl = cleanUrl.replace(/^http:\/{3,}/i, 'http://');
  if (cleanUrl.startsWith('//')) return `https:${cleanUrl}`;
  if (cleanUrl.startsWith('res.cloudinary.com')) return `https://${cleanUrl}`;
  return cleanUrl;
};

const getFullFileUrl = (url) => {
  const cleanUrl = normalizeFileUrl(url);
  if (!cleanUrl) return '';
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
  if (cleanUrl.startsWith('/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl.replace(/\/$/, '')}${cleanUrl}`;
  }
  return cleanUrl;
};

const getDownloadUrl = (url) => {
  const cleanUrl = normalizeFileUrl(url);
  if (!cleanUrl) return '';
  if (cleanUrl.includes('res.cloudinary.com') && cleanUrl.includes('/upload/')) {
    return cleanUrl.replace('/upload/', '/upload/fl_attachment/');
  }
  return getFullFileUrl(cleanUrl);
};

// ============================================================
// COMPONENT
// ============================================================

const Resources = () => {
  const { user } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [resources, setResources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Modals / Actions
  const [openingId, setOpeningId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [showPreview, setShowPreview] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingResource, setMovingResource] = useState(null);
  const [targetFolder, setTargetFolder] = useState('');

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setError('');
      const [resourcesRes, foldersRes] = await Promise.all([
        getResources({ folderId: selectedFolder }),
        getFolders(),
      ]);
      setResources(
        (resourcesRes.data.resources || []).map((r) => ({
          ...r,
          fileUrl: normalizeFileUrl(r.fileUrl),
        }))
      );
      setFolders(foldersRes.data.folders || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load resources or folders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user, selectedFolder]);

  // =========================================================
  // FILTER BY SEARCH
  // =========================================================

  const filteredResources = resources.filter((r) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =========================================================
  // UPLOAD
  // =========================================================

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    if (selectedFolder) formData.append('folderId', selectedFolder);

    try {
      await uploadResource(formData);
      setSuccess(`${file.name} uploaded successfully.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // =========================================================
  // FOLDER CRUD
  // =========================================================

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({ name: newFolderName });
      setNewFolderName('');
      setShowCreateFolder(false);
      await loadData();
    } catch (err) {
      setError('Failed to create folder.');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Delete this folder? Resources will be moved to root.')) return;
    try {
      await deleteFolder(folderId);
      if (selectedFolder === folderId) setSelectedFolder(null);
      await loadData();
    } catch (err) {
      setError('Failed to delete folder.');
    }
  };

  // =========================================================
  // MOVE RESOURCE
  // =========================================================

  const handleMoveResource = async () => {
    if (!movingResource) return;
    try {
      await updateResource(movingResource._id, {
        folderId: targetFolder === 'null' ? null : targetFolder,
      });
      setMovingResource(null);
      setTargetFolder('');
      await loadData();
    } catch (err) {
      setError('Failed to move resource.');
    }
  };

  // =========================================================
  // PIN / UNPIN
  // =========================================================

  const handleTogglePin = async (id, currentPin) => {
    try {
      await updateResource(id, { isPinned: !currentPin });
      await loadData();
    } catch (err) {
      setError('Failed to update pin.');
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete.');
    }
  };

  // =========================================================
  // OPEN / DOWNLOAD
  // =========================================================

  const handleOpen = async (resource) => {
    try {
      setOpeningId(resource._id);
      const url = getFullFileUrl(resource.fileUrl);
      if (!url) throw new Error('File URL is missing.');
      if (!url.startsWith('http://') && !url.startsWith('https://'))
        throw new Error(`Invalid resource URL: ${url}`);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.message || 'Unable to open this file.');
    } finally {
      setOpeningId(null);
    }
  };

  const handleDownload = async (resource) => {
    try {
      setDownloadingId(resource._id);
      const response = await downloadResource(resource._id);
      let downloadUrl = response?.data?.downloadUrl || resource.fileUrl;
      downloadUrl = getDownloadUrl(downloadUrl);
      if (!downloadUrl) throw new Error('Download URL is missing.');
      if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://'))
        throw new Error(`Invalid download URL: ${downloadUrl}`);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = resource.title || 'skillswap-resource';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Download failed.');
    } finally {
      setDownloadingId(null);
    }
  };

  // =========================================================
  // PREVIEW
  // =========================================================

  const handlePreview = (resource) => {
    setShowPreview(resource);
  };

  // =========================================================
  // ICON & FORMAT HELPERS
  // =========================================================

  const getIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'zip':
        return <Archive className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 rounded-full animate-spin border-slate-300 border-t-indigo-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading resources...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen p-4 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col gap-6 mx-auto max-w-7xl lg:flex-row">
        {/* ================================================
            SIDEBAR – Folders
        ================================================ */}
        <div className="lg:w-64 shrink-0">
          <div className="sticky p-4 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 dark:text-white">Folders</h3>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                title="Create folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            {/* All Resources */}
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition flex items-center gap-2 ${
                !selectedFolder
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <Folder className="w-4 h-4" />
              All Resources
            </button>

            {folders.map((folder) => (
              <div
                key={folder._id}
                className="flex items-center gap-2 mt-1 group"
              >
                <button
                  onClick={() => setSelectedFolder(folder._id)}
                  className={`flex-1 text-left px-3 py-2 rounded-xl text-sm transition flex items-center gap-2 ${
                    selectedFolder === folder._id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {folder.name}
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder._id)}
                  className="p-1 transition opacity-0 text-slate-400 hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {folders.length === 0 && (
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">No folders yet.</p>
            )}
          </div>
        </div>

        {/* ================================================
            MAIN CONTENT
        ================================================ */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Resources</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedFolder
                  ? `Showing folder: ${folders.find((f) => f._id === selectedFolder)?.name || 'Unknown'}`
                  : 'All resources'}
                {' • '}
                {filteredResources.length} items
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 py-2 pl-10 pr-4 text-sm bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 sm:w-56"
                />
              </div>
              {/* Upload */}
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-indigo-600 shadow cursor-pointer hover:bg-indigo-700 rounded-xl">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
              <button
                onClick={loadData}
                className="p-2 transition text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="p-3 mb-4 text-sm border text-emerald-700 bg-emerald-50 border-emerald-200 rounded-xl dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3 mb-4 text-sm border text-rose-700 bg-rose-50 border-rose-200 rounded-xl dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Resource Grid */}
          {filteredResources.length === 0 ? (
            <div className="p-12 text-center bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <File className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">No resources found</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try a different search term.' : 'Upload your first resource.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((res) => (
                <div
                  key={res._id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-4 transition hover:shadow-md ${
                    res.isPinned
                      ? 'border-indigo-400 dark:border-indigo-500'
                      : 'border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center min-w-0 gap-2">
                      <div className="flex-shrink-0 p-2 text-indigo-600 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {getIcon(res.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-slate-800 dark:text-white">
                          {res.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {res.type.toUpperCase()} • {formatSize(res.fileSize)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePin(res._id, res.isPinned)}
                      className={`p-1.5 rounded-lg transition ${
                        res.isPinned
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>👁️ {res.views || 0}</span>
                    <span>⬇️ {res.downloads || 0}</span>
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1 mt-3">
                    <button
                      onClick={() => handlePreview(res)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition border border-indigo-200 rounded-lg dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button
                      onClick={() => handleOpen(res)}
                      disabled={openingId === res._id}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition border border-slate-200 rounded-lg dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-50"
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </button>
                    <button
                      onClick={() => handleDownload(res)}
                      disabled={downloadingId === res._id}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition border border-slate-200 rounded-lg dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setMovingResource(res)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition border border-slate-200 rounded-lg dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      <Move className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteResource(res._id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition border border-rose-200 rounded-lg dark:text-rose-400 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================
          PREVIEW MODAL
      ================================================ */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPreview(null)}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(null)}
              className="absolute p-1.5 rounded-full top-3 right-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-white">{showPreview.title}</h3>
            {showPreview.type === 'image' && (
              <img
                src={showPreview.fileUrl}
                alt={showPreview.title}
                className="max-w-full max-h-[70vh] mx-auto rounded-lg object-contain"
              />
            )}
            {showPreview.type === 'pdf' && (
              <iframe
                src={showPreview.fileUrl}
                className="w-full h-[70vh] rounded-lg"
                title={showPreview.title}
              />
            )}
            {showPreview.type === 'video' && (
              <video
                src={showPreview.fileUrl}
                controls
                className="max-w-full max-h-[70vh] mx-auto rounded-lg"
              />
            )}
            {!['image', 'pdf', 'video'].includes(showPreview.type) && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                <File className="w-16 h-16 mb-4" />
                <p>Preview not available for this file type.</p>
                <a
                  href={showPreview.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Download / Open
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================
          CREATE FOLDER MODAL
      ================================================ */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Create Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================
          MOVE RESOURCE MODAL
      ================================================ */}
      {movingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
              Move "{movingResource.title}"
            </h3>
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="null">Root (No folder)</option>
              {folders.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleMoveResource}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
              >
                Move
              </button>
              <button
                onClick={() => {
                  setMovingResource(null);
                  setTargetFolder('');
                }}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;