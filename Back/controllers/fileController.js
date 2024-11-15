const fs = require('fs');
const path = require('path');
const db = require('../config/db');

exports.uploadFile = async (req, res) => {
    const { file } = req;
    const userId = req.user.id;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = file.path;
    const fileSize = file.size;
    const fileName = file.originalname;

    try {
        // Vérifier le quota de stockage
        const [result] = await db.query(
            'SELECT SUM(file_size) AS totalSize FROM files WHERE user_id = ?',
            [userId]
        );
        const totalSize = result[0]?.totalSize || 0;

        if (totalSize + fileSize > 20480 * 1024 * 1024) { // 20GB en octets
            return res.status(400).json({ message: 'Storage limit exceeded' });
        }

        // Insérer dans la base de données
        await db.query(
            'INSERT INTO files (user_id, file_name, file_path, file_size) VALUES (?, ?, ?, ?)',
            [userId, fileName, filePath, fileSize]
        );

        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ message: 'Error uploading file' });
    }
};

exports.listFiles = async (req, res) => {
    const userId = req.user.id;

    try {
        const [files] = await db.query('SELECT * FROM files WHERE user_id = ?', [userId]);
        res.status(200).json(files);
    } catch (err) {
        console.error('Error listing files:', err);
        res.status(500).json({ message: 'Error listing files' });
    }
};

exports.downloadFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        const [fileResult] = await db.query('SELECT * FROM files WHERE id = ?', [fileId]);
        const file = fileResult[0];

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(file.file_path, file.file_name);
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading file' });
    }
};

exports.deleteFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        const [fileResult] = await db.query('SELECT * FROM files WHERE id = ?', [fileId]);
        const file = fileResult[0];

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Supprimer le fichier physique
        fs.unlinkSync(file.file_path);

        // Supprimer l'entrée de la base de données
        await db.query('DELETE FROM files WHERE id = ?', [fileId]);

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ message: 'Error deleting file' });
    }
};
