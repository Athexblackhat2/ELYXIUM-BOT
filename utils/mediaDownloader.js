 
// 💾 ELYXIUM BOT v1.0 - MEDIA DOWNLOADER
// ⚡ Powered by ATHEX & ALTHEA
 

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config.json');
const { createBox, athexBadge, createProgressBar } = require('./embedBuilder');

 
// 📁 ENSURE DOWNLOAD DIRECTORIES
 
const downloadDir = path.join(__dirname, '..', 'downloads');
const dpDir = path.join(downloadDir, 'profile_pics');
const statusDir = path.join(downloadDir, 'status_saves');
const mediaDir = path.join(downloadDir, 'media');

const ensureDirectories = () => {
    [downloadDir, dpDir, statusDir, mediaDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Initialize on load
ensureDirectories();

 
// 🖼️ PROFILE PICTURE DOWNLOADER
 
const downloadProfilePic = async (sock, userId, targetJid = null) => {
    try {
        const jid = targetJid || userId;
        
        // Get profile picture URL
        let profilePicUrl;
        try {
            profilePicUrl = await sock.profilePictureUrl(jid, 'image');
        } catch (err) {
            // Try with full JID
            const fullJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
            profilePicUrl = await sock.profilePictureUrl(fullJid, 'image');
        }

        if (!profilePicUrl) {
            return { success: false, message: '❌ No profile picture found!' };
        }

        // Download image
        const response = await axios.get(profilePicUrl, { 
            responseType: 'arraybuffer',
            timeout: 10000
        });
        
        const timestamp = Date.now();
        const fileName = `dp_${jid.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.jpg`;
        const filePath = path.join(dpDir, fileName);
        
        fs.writeFileSync(filePath, response.data);
        
        // Get file size
        const stats = fs.statSync(filePath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        const message = `
 
    🖼️  DP DOWNLOADED! 🖼️      
                                  
   📁 File: ${fileName.padEnd(20)} 
   📊 Size: ${fileSizeKB.padEnd(20)} 
   ✅ Saved Successfully!        
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

        // Send the image back
        await sock.sendMessage(userId, {
            image: { url: filePath },
            caption: message
        });

        return {
            success: true,
            fileName,
            filePath,
            fileSize: fileSizeKB,
            message
        };

    } catch (error) {
        console.error('❌ DP Download Error:', error);
        return { 
            success: false, 
            message: '❌ Failed to download profile picture! User might have default/no DP.' 
        };
    }
};

 
// 📸 STATUS/STORY SAVER
 
const saveStatus = async (sock, userId, statusMessage) => {
    try {
        if (!statusMessage) {
            return { success: false, message: '❌ No status message provided!' };
        }

        const messageType = Object.keys(statusMessage.message || {})[0];
        let savedFile = null;
        let mediaType = '';

        // Handle Image Status
        if (messageType === 'imageMessage') {
            const imageMsg = statusMessage.message.imageMessage;
            const buffer = await sock.downloadMediaMessage(statusMessage);
            
            const fileName = `status_image_${Date.now()}.jpg`;
            const filePath = path.join(statusDir, fileName);
            fs.writeFileSync(filePath, buffer);
            
            savedFile = { fileName, filePath, type: 'image' };
            mediaType = '🖼️ Image';
        }
        
        // Handle Video Status
        else if (messageType === 'videoMessage') {
            const videoMsg = statusMessage.message.videoMessage;
            const buffer = await sock.downloadMediaMessage(statusMessage);
            
            const fileName = `status_video_${Date.now()}.mp4`;
            const filePath = path.join(statusDir, fileName);
            fs.writeFileSync(filePath, buffer);
            
            savedFile = { fileName, filePath, type: 'video' };
            mediaType = '🎬 Video';
        }
        
        // Handle Text Status (save as text)
        else if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            const text = messageType === 'conversation' 
                ? statusMessage.message.conversation 
                : statusMessage.message.extendedTextMessage.text;
            
            const fileName = `status_text_${Date.now()}.txt`;
            const filePath = path.join(statusDir, fileName);
            fs.writeFileSync(filePath, text);
            
            savedFile = { fileName, filePath, type: 'text' };
            mediaType = '📝 Text';
        }
        
        else {
            return { success: false, message: '❌ Unsupported status type!' };
        }

        const stats = fs.statSync(savedFile.filePath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        const message = `
 
    📸 STATUS SAVED! 📸         
                                  
   📁 File: ${savedFile.fileName.padEnd(15)} 
   📊 Size: ${fileSizeKB.padEnd(15)} 
   📋 Type: ${mediaType.padEnd(15)} 
   ✅ Saved Successfully!        
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

        // Send confirmation
        await sock.sendMessage(userId, { text: message });

        // If image/video, send it back
        if (savedFile.type === 'image') {
            await sock.sendMessage(userId, { 
                image: { url: savedFile.filePath },
                caption: '📸 Here is your saved status!'
            });
        } else if (savedFile.type === 'video') {
            await sock.sendMessage(userId, { 
                video: { url: savedFile.filePath },
                caption: '🎬 Here is your saved status!'
            });
        }

        return {
            success: true,
            ...savedFile,
            fileSize: fileSizeKB,
            mediaType
        };

    } catch (error) {
        console.error('❌ Status Save Error:', error);
        return { success: false, message: '❌ Failed to save status!' };
    }
};

 
// 📥 GENERAL MEDIA DOWNLOADER
 
const downloadMedia = async (sock, userId, mediaMessage) => {
    try {
        const buffer = await sock.downloadMediaMessage(mediaMessage);
        
        if (!buffer) {
            return { success: false, message: '❌ No media found in message!' };
        }

        const messageType = Object.keys(mediaMessage.message || {})[0];
        let extension = 'bin';
        let mediaTypeName = 'File';

        // Determine file extension
        switch(messageType) {
            case 'imageMessage':
                extension = mediaMessage.message.imageMessage.mimetype === 'image/png' ? 'png' : 'jpg';
                mediaTypeName = '🖼️ Image';
                break;
            case 'videoMessage':
                extension = 'mp4';
                mediaTypeName = '🎬 Video';
                break;
            case 'audioMessage':
                extension = mediaMessage.message.audioMessage.mimetype === 'audio/mp4' ? 'm4a' : 'mp3';
                mediaTypeName = '🎵 Audio';
                break;
            case 'documentMessage':
                extension = mediaMessage.message.documentMessage.fileName?.split('.').pop() || 'bin';
                mediaTypeName = '📄 Document';
                break;
            case 'stickerMessage':
                extension = 'webp';
                mediaTypeName = '🎯 Sticker';
                break;
        }

        const fileName = `${mediaTypeName.replace(/[^a-zA-Z]/g, '_').toLowerCase()}_${Date.now()}.${extension}`;
        const filePath = path.join(mediaDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        
        const stats = fs.statSync(filePath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        const displaySize = stats.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

        const message = `
 
    📥 MEDIA DOWNLOADED! 📥     
                                  
   📁 File: ${fileName.padEnd(15)} 
   📊 Size: ${displaySize.padEnd(15)} 
   📋 Type: ${mediaTypeName.padEnd(15)} 
   ✅ Saved Successfully!        
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

        await sock.sendMessage(userId, { text: message });

        return {
            success: true,
            fileName,
            filePath,
            fileSize: displaySize,
            mediaType: mediaTypeName
        };

    } catch (error) {
        console.error('❌ Media Download Error:', error);
        return { success: false, message: '❌ Failed to download media!' };
    }
};

 
// 📊 DOWNLOAD STATISTICS
 
const downloadStats = {
    totalDownloads: 0,
    profilePics: 0,
    statusSaves: 0,
    mediaDownloads: 0,
    totalSizeBytes: 0,
    history: []
};

const updateStats = (type, filePath) => {
    downloadStats.totalDownloads++;
    
    switch(type) {
        case 'dp':
            downloadStats.profilePics++;
            break;
        case 'status':
            downloadStats.statusSaves++;
            break;
        case 'media':
            downloadStats.mediaDownloads++;
            break;
    }
    
    if (filePath && fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        downloadStats.totalSizeBytes += stats.size;
    }
    
    downloadStats.history.push({
        type,
        filePath,
        timestamp: new Date().toISOString()
    });
    
    // Keep last 100 records
    if (downloadStats.history.length > 100) {
        downloadStats.history.shift();
    }
};

const getDownloadStats = () => {
    const totalSizeMB = (downloadStats.totalSizeBytes / (1024 * 1024)).toFixed(2);
    const totalSizeGB = (downloadStats.totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
    const displaySize = downloadStats.totalSizeBytes > 1024 * 1024 * 1024 
        ? `${totalSizeGB} GB` 
        : `${totalSizeMB} MB`;

    return {
        ...downloadStats,
        totalSizeDisplay: displaySize
    };
};

 
// 🗂️ LIST SAVED FILES
 
const listSavedFiles = (type = 'all') => {
    const files = {
        profilePics: [],
        statusSaves: [],
        media: []
    };

    try {
        if (type === 'all' || type === 'dp') {
            files.profilePics = fs.readdirSync(dpDir)
                .map(f => ({ name: f, path: path.join(dpDir, f) }))
                .slice(-10); // Last 10
        }
        
        if (type === 'all' || type === 'status') {
            files.statusSaves = fs.readdirSync(statusDir)
                .map(f => ({ name: f, path: path.join(statusDir, f) }))
                .slice(-10);
        }
        
        if (type === 'all' || type === 'media') {
            files.media = fs.readdirSync(mediaDir)
                .map(f => ({ name: f, path: path.join(mediaDir, f) }))
                .slice(-10);
        }
    } catch (error) {
        console.error('❌ Error listing files:', error);
    }

    return files;
};

 
// 🗑️ CLEAR DOWNLOADS
 
const clearDownloads = (type = 'all') => {
    try {
        if (type === 'all' || type === 'dp') {
            const dpFiles = fs.readdirSync(dpDir);
            dpFiles.forEach(f => fs.unlinkSync(path.join(dpDir, f)));
        }
        
        if (type === 'all' || type === 'status') {
            const statusFiles = fs.readdirSync(statusDir);
            statusFiles.forEach(f => fs.unlinkSync(path.join(statusDir, f)));
        }
        
        if (type === 'all' || type === 'media') {
            const mediaFiles = fs.readdirSync(mediaDir);
            mediaFiles.forEach(f => fs.unlinkSync(path.join(mediaDir, f)));
        }

        return { success: true, message: `🗑️ ${type === 'all' ? 'All' : type} downloads cleared!` };
    } catch (error) {
        return { success: false, message: '❌ Failed to clear downloads!' };
    }
};

 
// 📤 EXPORTS
 
module.exports = {
    downloadProfilePic,
    saveStatus,
    downloadMedia,
    listSavedFiles,
    clearDownloads,
    getDownloadStats,
    updateStats,
    downloadStats
};

 
// ⚡ ELYXIUM BOT v1.0 - Media Downloader Ready!
// ⚡ Powered by ATHEX & ALTHEA
 