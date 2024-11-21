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
    const userId = req.user.user_id;  // Assuming userId is set in req.user via middleware
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
    const userId = req.user.user_id; // Assuming userId is set in req.user via middleware

    try {
        console.log(`DEBUG: Retrieving files for user: ${userId}`);

        // Adjust column names to match the actual database schema
        const [files] = await db.query(
            'SELECT id, file_name AS name, size, mimeType, created_at AS  created_at FROM files WHERE user_id = ?',
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
    const userId = req.user.user_id; 

    try {
        const [files] = await db.query(
            'SELECT id, file_name, file_size, file_type,  created_at FROM files WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
};
exports.deleteFile = async (req, res) => {
    const userId = req.user.user_id // Assuming userId is set in req.user via middleware
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
    const userId = req.user.user_id;  // Assuming userId is set in req.user via middleware
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
    const userId = req.user.user_id;  // Assuming userId is available in req.user from authentication middleware

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


exports.getFilteredAndSortedFiles = async (req, res) => {
    const { format, search, sortBy, order } = req.query;
    const userId = req.user.user_id;
  
    try {
      // Debug: Print the query parameters
      console.log("DEBUG: Received query parameters:", req.query);
  
      // Build the SQL query with filters and sorting
      let sqlQuery = `
        SELECT id, name, size, mimeType, created_at 
        FROM files 
        WHERE user_id = ?
      `;
  
      // Add the filter for 'format' if provided
      if (format) {
        sqlQuery += ` AND mimeType LIKE ?`;
      }
  
      // Add the search filter if provided
      if (search) {
        sqlQuery += ` AND name LIKE ?`;
      }
  
      // Add sorting logic based on 'sortBy' and 'order'
      sqlQuery += ` ORDER BY ${sortBy} ${order}`;
  
      // Debug: Print the final SQL query
      console.log("DEBUG: Final SQL query:", sqlQuery);
  
      // Execute the query with parameters
      const [files] = await db.query(sqlQuery, [
        userId,
        format ? `%${format}%` : undefined,  // If 'format' exists, filter by mimeType
        search ? `%${search}%` : undefined,  // If 'search' exists, filter by file name
      ]);
  
      // Debug: Log the files retrieved
    //   console.log("DEBUG: Files retrieved:", files);
  
      res.status(200).json({
        message: "Files retrieved successfully",
        files: files,
      });
    } catch (error) {
      console.error("Error retrieving files:", error);
      res.status(500).json({ message: "Error retrieving files." });
    }
  };
  