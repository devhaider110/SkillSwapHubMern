const Resource = require('../models/Resource');
const Folder = require('../models/Folder');
const cloudinary = require('cloudinary').v2;

// ============================================================
// HELPER: Determine file type from mimetype and extension
// ============================================================

const getFileType = (mimetype = '', originalName = '') => {
  const mime = mimetype.toLowerCase();
  const name = originalName.toLowerCase();

  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (mime.includes('presentation') || mime.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
  if (mime.includes('word') || mime.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) return 'doc';
  if (mime.includes('spreadsheet') || mime.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return 'spreadsheet';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('compressed') || name.endsWith('.zip') || name.endsWith('.rar')) return 'zip';
  return 'other';
};

// ============================================================
// HELPER: Normalize URL (remove extra slashes, add protocol)
// ============================================================

const normalizeUrl = (url) => {
  if (!url) return '';
  let cleanUrl = String(url).trim();
  cleanUrl = cleanUrl.replace(/^https:\/+(?!\/)/i, 'https://');
  cleanUrl = cleanUrl.replace(/^http:\/+(?!\/)/i, 'http://');
  if (cleanUrl.startsWith('//')) return `https:${cleanUrl}`;
  if (cleanUrl.startsWith('res.cloudinary.com')) return `https://${cleanUrl}`;
  return cleanUrl;
};

// ============================================================
// HELPER: Extract Cloudinary resource type from URL
// ============================================================

const getCloudinaryResourceType = (url) => {
  const cleanUrl = normalizeUrl(url);
  if (cleanUrl.includes('/image/upload/')) return 'image';
  if (cleanUrl.includes('/video/upload/')) return 'video';
  return 'raw';
};

// ============================================================
// HELPER: Extract public ID from Cloudinary URL
// ============================================================

const getPublicIdFromUrl = (url) => {
  try {
    const cleanUrl = normalizeUrl(url);
    const uploadIndex = cleanUrl.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let publicId = cleanUrl.substring(uploadIndex + '/upload/'.length);
    const parts = publicId.split('/');

    // Remove transformations (e.g., c_scale, f_auto, etc.)
    while (parts.length > 0 && /^[a-z]_/.test(parts[0])) parts.shift();
    // Remove version (v12345)
    if (parts.length > 0 && /^v\d+$/.test(parts[0])) parts.shift();

    publicId = parts.join('/');
    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, '');
    return publicId || null;
  } catch (error) {
    console.error('Public ID extraction error:', error);
    return null;
  }
};

// ============================================================
// UPLOAD RESOURCE
// ============================================================

exports.uploadResource = async (req, res) => {
  try {
    console.log('🔹 Upload started');
    console.log('🔸 req.file:', req.file ? req.file : 'NO FILE');
    console.log('🔸 req.user:', req.user?._id);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Get URL from Cloudinary – multer-storage-cloudinary stores it in req.file.path or .secure_url
    let fileUrl = req.file.secure_url || req.file.path || req.file.url || '';
    fileUrl = normalizeUrl(fileUrl);

    if (!fileUrl) {
      console.error('❌ No URL found in req.file:', req.file);
      return res.status(500).json({ success: false, message: 'Cloudinary did not return a file URL.' });
    }

    const { title, description, folderId, sessionId, swapRequestId } = req.body;
    const userId = req.user._id;

    const originalName = req.file.originalname || 'file';
    const fileType = getFileType(req.file.mimetype, originalName);
    const extension = originalName.includes('.') ? originalName.split('.').pop().toLowerCase() : '';

    const resource = await Resource.create({
      userId,
      swapRequestId: swapRequestId || null,
      sessionId: sessionId || null,
      title: title?.trim() || originalName,
      description: description || '',
      type: fileType,
      fileUrl,
      fileSize: req.file.size || 0,
      fileExtension: extension,
      folderId: folderId || null,
      isPinned: false,
      views: 0,
      downloads: 0,
    });

    console.log('✅ Resource saved:', resource._id);
    return res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully.',
      resource: {
        ...resource.toObject(),
        fileUrl: normalizeUrl(resource.fileUrl),
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Resource upload failed.',
    });
  }
};

// ============================================================
// GET RESOURCES
// ============================================================

exports.getResources = async (req, res) => {
  try {
    const { sessionId, swapRequestId, folderId } = req.query;
    const userId = req.user._id;

    const filter = { userId };
    if (sessionId) filter.sessionId = sessionId;
    if (swapRequestId) filter.swapRequestId = swapRequestId;
    if (folderId !== undefined) filter.folderId = folderId === 'null' ? null : folderId;

    const resources = await Resource.find(filter)
      .populate('folderId', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    const cleaned = resources.map((r) => ({
      ...r.toObject(),
      fileUrl: normalizeUrl(r.fileUrl),
    }));

    return res.status(200).json({ success: true, resources: cleaned });
  } catch (error) {
    console.error('Get resources error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to get resources.' });
  }
};

// ============================================================
// GET SINGLE RESOURCE
// ============================================================

exports.getResource = async (req, res) => {
  try {
    const userId = req.user._id;
    const resource = await Resource.findOne({ _id: req.params.id, userId });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    resource.views += 1;
    await resource.save();

    return res.status(200).json({
      success: true,
      resource: {
        ...resource.toObject(),
        fileUrl: normalizeUrl(resource.fileUrl),
      },
    });
  } catch (error) {
    console.error('Get resource error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// UPDATE RESOURCE
// ============================================================

exports.updateResource = async (req, res) => {
  try {
    const userId = req.user._id;
    const resource = await Resource.findOne({ _id: req.params.id, userId });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const { title, description, folderId, isPinned } = req.body;
    if (title !== undefined) resource.title = String(title).trim();
    if (description !== undefined) resource.description = description;
    if (folderId !== undefined) resource.folderId = folderId === 'null' ? null : folderId;
    if (isPinned !== undefined) resource.isPinned = isPinned === true || isPinned === 'true';

    await resource.save();

    return res.status(200).json({
      success: true,
      message: 'Resource updated successfully.',
      resource: {
        ...resource.toObject(),
        fileUrl: normalizeUrl(resource.fileUrl),
      },
    });
  } catch (error) {
    console.error('Update resource error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// DELETE RESOURCE
// ============================================================

exports.deleteResource = async (req, res) => {
  try {
    const userId = req.user._id;
    const resource = await Resource.findOne({ _id: req.params.id, userId });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Delete from Cloudinary
    try {
      const publicId = getPublicIdFromUrl(resource.fileUrl);
      const resourceType = getCloudinaryResourceType(resource.fileUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: 'upload' });
        console.log('Cloudinary deleted:', publicId);
      }
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr.message);
    }

    await resource.deleteOne();
    return res.status(200).json({ success: true, message: 'Resource deleted successfully.' });
  } catch (error) {
    console.error('Delete resource error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// DOWNLOAD RESOURCE (increment download counter and return URL)
// ============================================================

exports.downloadResource = async (req, res) => {
  try {
    const userId = req.user._id;
    const resource = await Resource.findOne({ _id: req.params.id, userId });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    resource.downloads += 1;
    await resource.save();

    const downloadUrl = normalizeUrl(resource.fileUrl);
    if (!downloadUrl) {
      return res.status(500).json({ success: false, message: 'Resource URL is invalid.' });
    }

    return res.status(200).json({
      success: true,
      downloadUrl,
      resource: {
        ...resource.toObject(),
        fileUrl: downloadUrl,
      },
    });
  } catch (error) {
    console.error('Download resource error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// FOLDERS
// ============================================================

exports.createFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, parentFolderId } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required.' });
    }

    const folder = await Folder.create({
      userId,
      name: String(name).trim(),
      parentFolderId: parentFolderId || null,
    });
    return res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user._id }).sort({ name: 1 });
    return res.status(200).json({ success: true, folders });
  } catch (error) {
    console.error('Get folders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const folder = await Folder.findOne({ _id: req.params.id, userId });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    // Move resources to root folder (folderId = null)
    await Resource.updateMany({ folderId: folder._id, userId }, { folderId: null });
    await folder.deleteOne();

    return res.status(200).json({ success: true, message: 'Folder deleted successfully.' });
  } catch (error) {
    console.error('Delete folder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};