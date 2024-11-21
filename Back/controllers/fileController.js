const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Configure Multer
const upload = multer({
    dest: path.join(__dirname, '../uploads'),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});




exports.uploadFile = async (req, res) => {
<<<<<<< HEAD
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
=======
    const userId = req.user.user_id;  // Assuming userId is set in req.user via middleware
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Retrieve the user's total storage limit and current usage
        const [userResult] = await db.query(
            'SELECT total_storage, IFNULL(SUM(f.size) / (1024 * 1024), 0) AS current_storage_MB ' +
            'FROM users u LEFT JOIN files f ON u.id = f.user_id WHERE u.id = ? GROUP BY u.id',
            [userId]
        );

        if (!userResult.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { total_storage, current_storage_MB } = userResult[0];
        const fileSizeMB = file.size / (1024 * 1024); // File size in MB
        const remainingStorage = total_storage - current_storage_MB;

        // Check if the file exceeds the remaining storage
        if (fileSizeMB > remainingStorage) {
            fs.unlinkSync(file.path); // Delete the uploaded file
            return res.status(400).json({ message: 'Storage limit exceeded' });
        }

        // Extract file name without extension
        const fileNameWithoutExtension = path.parse(file.originalname).name;

        // Insert file metadata into the database
        const query = `
            INSERT INTO files (user_id, file_name, name, path, size, file_size, mimeType, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const values = [
            userId,                // user_id
            file.originalname,     // file_name (full name with extension)
            fileNameWithoutExtension, // name (without extension)
            file.path,             // path
            file.size,             // size in bytes
            file.size,             // file_size in bytes
            file.mimetype          // mimeType
        ];

        const [insertResult] = await db.query(query, values);
        console.log('DEBUG: File metadata inserted into database:', insertResult);

        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('File upload error:', error);

        // Cleanup: Delete the uploaded file if an error occurs
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};









// Middleware for handling file uploads
exports.uploadMiddleware = upload.single('file');
exports.getFiles = async (req, res) => {
<<<<<<< HEAD
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
=======
    const userId = req.user.user_id; // Assuming userId is set in req.user via middleware
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175

    try {
        console.log(`DEBUG: Retrieving files for user: ${userId}`);

        // Adjust column names to match the actual database schema
        const [files] = await db.query(
            'SELECT id, file_name AS name, size, mimeType, created_at AS uploaded_at FROM files WHERE user_id = ?',
            [userId]
        );

        if (files.length === 0) {
            console.log('DEBUG: No files found for user:', userId);
            return res.status(404).json({ message: 'No files found' });
        }

        console.log(`DEBUG: Retrieved ${files.length} files for user: ${userId}`);
        res.status(200).json({
            message: 'Files retrieved successfully',
            files,
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({
            message: 'Error retrieving files',
            error: error.message,
        });
    }
};

exports.getUserFiles = async (req, res) => {
<<<<<<< HEAD
    const { userId } = req.user;
=======
    const userId = req.user.user_id; 
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175

    try {
        const [files] = await db.query(
            'SELECT id, file_name, file_size, file_type, uploaded_at FROM files WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
};
exports.deleteFile = async (req, res) => {
<<<<<<< HEAD
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
=======
    const userId = req.user.user_id // Assuming userId is set in req.user via middleware
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
    const { fileId } = req.params; // File ID from request parameters

    try {
        console.log(`DEBUG: Deleting file with ID: ${fileId} by user: ${userId}`);

        // Retrieve file path for deletion
        const [fileResult] = await db.query(
            'SELECT path FROM files WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (fileResult.length === 0) {
            return res.status(404).json({ message: 'File not found or no permission to delete' });
        }

        const filePath = fileResult[0].path;

        // Remove file from the server
        fs.unlinkSync(filePath);
        console.log(`DEBUG: File deleted from server: ${filePath}`);

        // Delete file record from the database
        const [result] = await db.query(
            'DELETE FROM files WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or no permission to delete' });
        }

        console.log('DEBUG: File metadata deleted from database:', result);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
};
exports.updateFileMetadata = async (req, res) => {
<<<<<<< HEAD
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
=======
    const userId = req.user.user_id;  // Assuming userId is set in req.user via middleware
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
    const { fileId } = req.params; // File ID from request parameters
    const { name } = req.body; // New file name from request body

    if (!name) {
        return res.status(400).json({ message: 'File name is required' });
    }

    try {
        console.log(`DEBUG: Updating file metadata for file ID: ${fileId} by user: ${userId}`);

        // Update file metadata in the database
        const [result] = await db.query(
            'UPDATE files SET file_name = ? WHERE id = ? AND user_id = ?',
            [name, fileId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or no permission to update' });
        }

        console.log('DEBUG: File metadata updated successfully:', result);
        res.status(200).json({ message: 'File metadata updated successfully' });
    } catch (error) {
        console.error('Error updating file metadata:', error);
        res.status(500).json({ message: 'Error updating file metadata', error: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    const { fileId } = req.params;
<<<<<<< HEAD
    const { userId } = req.user; // Assuming userId is available in req.user from authentication middleware
=======
    const userId = req.user.user_id;  // Assuming userId is available in req.user from authentication middleware
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175

    try {
        // Retrieve file metadata from the database
        const [result] = await db.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }

        const file = result[0];
        const filePath = file.path;

        // Check if the file exists on the server
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on the server' });
        }

        // Send the file to the user
        return res.download(filePath, file.file_name, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        console.error('Error in downloadFile:', error);
        res.status(500).json({ message: 'Error processing file download', error: error.message });
    }
};


<<<<<<< HEAD

exports.getFilteredAndSortedFiles = async (req, res) => {
        const { userId } = req.user; // Récupérer l'utilisateur connecté via middleware
        const { format, search, sortBy, order } = req.query; // Récupérer les paramètres de filtrage et de tri
    
        try {
            // Base query
            let query = `
                SELECT id, file_name, name, size, mimeType, created_at 
                FROM files 
                WHERE user_id = ?
            `;
            const values = [userId];
    
            // Ajouter un filtre par format de fichier (mimeType)
            if (format) {
                query += ' AND mimeType LIKE ?';
                values.push(`${format}%`);
            }
    
            // Ajouter une recherche par nom de fichier avec LIKE %%
            if (search) {
                query += ' AND name LIKE ?';
                values.push(`%${search}%`);
            }
    
            // Ajouter un tri
            if (sortBy) {
                const validSortBy = ['created_at', 'size']; // Champs autorisés pour le tri
                const validOrder = ['ASC', 'DESC']; // Ordre de tri valide
    
                if (validSortBy.includes(sortBy)) {
                    query += ` ORDER BY ${sortBy}`;
                    query += validOrder.includes(order) ? ` ${order}` : ' ASC';
                }
            }
    
            // Exécuter la requête SQL
            const [files] = await db.query(query, values);
    
            res.status(200).json({ files });
        } catch (error) {
            console.error('Error fetching user files:', error);
            res.status(500).json({ message: 'Error fetching files', error: error.message });
        }
    };
    
=======
// In fileController.js

exports.getFilteredAndSortedFiles = async (req, res) => {
    const userId = req.user.user_id;  // Get the user ID from the decoded JWT
    const { format, search, sortBy, order } = req.query;  // Get filter params from query
    console.log("DEBUG: Received query parameters:", req.query);

    // Debug: Log the incoming query parameters
    console.log("DEBUG: Received query parameters:", { format, search, sortBy, order });
  
    try {
      let query = `
        SELECT id, name, size, mimeType, uploaded_at
        FROM files
        WHERE user_id = ?
      `;
      const values = [userId];  // User ID is mandatory in the WHERE clause
  
      // Apply the format filter if provided
      if (format) {
        query += ' AND mimeType LIKE ?';
        values.push(`${format}%`);  // For example: "application/pdf"
        console.log("DEBUG: Applied format filter:", format);
      }
  
      // Apply the search filter if provided
      if (search) {
        query += ' AND name LIKE ?';
        values.push(`%${search}%`);  // Match any part of the filename
        console.log("DEBUG: Applied search filter:", search);
      }
  
      // Apply sorting if provided
      const validSortBy = ['uploaded_at', 'size'];  // List of allowed columns for sorting
      const validOrder = ['ASC', 'DESC'];  // Sorting orders: Ascending or Descending
  
      // Check if the sort parameters are valid
      if (validSortBy.includes(sortBy) && validOrder.includes(order)) {
        query += ` ORDER BY ${sortBy} ${order}`;
        console.log("DEBUG: Sorting applied:", sortBy, order);
      } else {
        query += ' ORDER BY uploaded_at DESC';  // Default sort by date descending
        console.log("DEBUG: Default sorting applied: uploaded_at DESC.");
      }
  
      // Debug: Log the final query
      console.log("DEBUG: Final SQL query:", query);
  
      // Execute the query
      const [files] = await db.query(query, values);
  
      // Debug: Log the result from the query
      console.log("DEBUG: Files retrieved:", files);
  
      res.status(200).json({ message: "Files retrieved successfully", files });  // Return the files in the response
    } catch (error) {
      console.error('Error fetching user files:', error);
      res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
  };
  
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
