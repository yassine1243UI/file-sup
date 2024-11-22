const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Get all users with their file counts and storage usage
exports.getAllUsers = async (req, res) => {
    try {
        console.log('DEBUG: Fetching all users with file stats');

        const [users] = await db.query(`
            SELECT 
                *,
                COUNT(f.id) AS file_count,
                COALESCE(SUM(f.size), 0) AS total_storage
            FROM users u
            LEFT JOIN files f ON u.id = f.user_id
            GROUP BY u.id
        `);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get all files from all users
exports.getAllUserFiles = async (req, res) => {
    try {
        console.log('DEBUG: Fetching all user files');

        const [files] = await db.query(`
            SELECT 
                f.id, f.file_name, f.size, f.mimeType, f.created_at,f.user_id,
                u.name as user_name, u.email, u.id
            FROM files f 
            JOIN users u ON f.user_id = u.id
        `);

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching all user files:', error);
        res.status(500).json({ message: 'Error fetching all user files', error: error.message });
    }
};

// Get system-wide statistics
exports.getSystemStats = async (req, res) => {
    try {
        console.log('DEBUG: Fetching system statistics');

        const [totalStorage] = await db.query('SELECT COALESCE(SUM(size), 0) as totalStorage FROM files');
        const [totalFiles] = await db.query('SELECT COUNT(*) as totalFiles FROM files');
        const [userStats] = await db.query(`
            SELECT 
                u.id as userId, u.name, u.email, 
                COUNT(f.id) as fileCount, 
                COALESCE(SUM(f.size), 0) as storageUsed 
            FROM users u 
            LEFT JOIN files f ON u.id = f.user_id 
            GROUP BY u.id
        `);

        res.status(200).json({
            totalStorageUsed: totalStorage[0]?.totalStorage || 0,
            totalFilesUploaded: totalFiles[0]?.totalFiles || 0,
            userStats,
        });
    } catch (error) {
        console.error('Error fetching system statistics:', error);
        res.status(500).json({ message: 'Error fetching system statistics', error: error.message });
    }
};

// Admin deletes a specific file
exports.deleteUserFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        console.log(`DEBUG: Admin attempting to delete file with ID: ${fileId}`);

        // Retrieve file path for deletion
        const [fileResult] = await db.query('SELECT path FROM files WHERE id = ?', [fileId]);

        if (fileResult.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = fileResult[0].path;

        // Remove file from the server
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`DEBUG: File deleted from server: ${filePath}`);
        } else {
            console.warn(`WARNING: File path does not exist: ${filePath}`);
        }

        // Delete file record from the database
        const [result] = await db.query('DELETE FROM files WHERE id = ?', [fileId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or no permission to delete' });
        }

        console.log('DEBUG: File metadata deleted from database:', result);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting user file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
};
exports.getAllUsersWithStats = async (req, res) => {
        const { userId } = req.params;
    
        try {
            console.log(`DEBUG: Fetching details for user ID: ${userId}`);
            
            const query = `
                SELECT 
                    u.id AS userId, 
                    u.name, 
                    u.email, 
                    u.role, 
                    (u.total_storage + COALESCE(u.extra_storage, 0)) AS totalStorage, 
                    COALESCE(SUM(f.size), 0) AS usedStorage,
                    (u.total_storage + COALESCE(u.extra_storage, 0)) - COALESCE(SUM(f.size), 0) AS remainingStorage
                FROM users u
                LEFT JOIN files f ON u.id = f.user_id
                WHERE u.id = ?
                GROUP BY u.id
            `;
    
            const [result] = await db.query(query, [userId]);
    
            if (!result.length) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            console.log('DEBUG: User details fetched:', result[0]);
            res.status(200).json(result[0]);
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Error fetching user details', error: error.message });
        }
    };
    


    exports.deleteUser = async (req, res) => {
        const userId = req.params.id;
        
            console.log('DEBUG: req.params:', req.params); // Log req.params for debugging
        
            if (!userId) {
                console.error('DEBUG: userId is missing in req.params:', req.params);
                return res.status(400).json({ message: 'User ID is required' });
            }
        
            try {
                console.log(`DEBUG: Processing delete action for user ID: ${userId}`);
        
                // Verify if the user exists
                const [userCheck] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        
                if (!userCheck.length) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                // Count and delete user files
                const [fileCount] = await db.query('SELECT COUNT(*) AS count FROM files WHERE user_id = ?', [userId]);
                const deletedFileCount = fileCount[0]?.count || 0;
        
                await db.query('DELETE FROM files WHERE user_id = ?', [userId]);
                await db.query('DELETE FROM users WHERE id = ?', [userId]);
        
                console.log(`DEBUG: User ${userId} and their files deleted`);
        
                res.status(200).json({
                    message: `User and ${deletedFileCount} files deleted successfully`,
                });
            } catch (error) {
                console.error(`Error processing delete action for user ID: ${userId}`, error);
                res.status(500).json({ message: 'Error processing delete action', error: error.message });
            }
        };
        
        exports.getUploadStats = async (req, res) => {
            try {
                // Files uploaded by day
                const [filesPerDay] = await db.query(`
                    SELECT 
                        DATE(created_at) AS uploadDate, 
                        COUNT(*) AS fileCount 
                    FROM files 
                    GROUP BY DATE(created_at)
                    ORDER BY uploadDate DESC
                `);
        
                // Files uploaded by week
                const [filesPerWeek] = await db.query(`
                    SELECT 
                        YEARWEEK(created_at) AS week, 
                        COUNT(*) AS fileCount 
                    FROM files 
                    GROUP BY YEARWEEK(created_at)
                    ORDER BY week DESC
                `);
        
                res.status(200).json({
                    message: 'Upload statistics retrieved successfully',
                    filesPerDay,
                    filesPerWeek,
                });
            } catch (error) {
                console.error('Error retrieving upload statistics:', error);
                res.status(500).json({ message: 'Error retrieving upload statistics', error: error.message });
            }
        };
        

        exports.getMonthlyUsers = async (req, res) => {
            try {
                const formatDateForSQL = (date) => {
                    return date.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
                };
        
                // Calculer la date de début et de fin du mois actuel
                const startOfMonth = formatDateForSQL(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                const endOfMonth = formatDateForSQL(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59));
        
                // Requête SQL pour compter les utilisateurs créés au cours du mois
                const [results] = await db.query(`
                    SELECT COUNT(id) AS totalUsers
                    FROM users
                    WHERE created_at BETWEEN ? AND ?
                `, [startOfMonth, endOfMonth]);
        
                const totalUsers = results[0].totalUsers;
        
                // Retourner seulement le nombre d'utilisateurs
                res.status(200).json({ totalUsers });
            } catch (error) {
                console.error('Erreur lors du calcul des utilisateurs mensuels :', error);
                res.status(500).json({ message: 'Erreur lors du calcul des utilisateurs mensuels', error: error.message });
            }
        };



        exports.getTotalStorageUsed = async (req, res) => {
            try {
                const [storageStats] = await db.query(`
                    SELECT 
                        COALESCE(SUM(size), 0) AS totalStorageUsed 
                    FROM files
                `);
        
                res.status(200).json({
                    message: 'Total storage used retrieved successfully',
                    totalStorageUsed: storageStats[0].totalStorageUsed,
                });
            } catch (error) {
                console.error('Error retrieving total storage stats:', error);
                res.status(500).json({ message: 'Error retrieving total storage stats', error: error.message });
            }
        };
        

        exports.getUserStats = async (req, res) => {
                try {
                    const [userStats] = await db.query(`
                        SELECT 
                            SUM(active = 1) AS activeUsers,
                            SUM(active = 0) AS inactiveUsers
                        FROM users
                    `);
            
                    res.status(200).json({
                        message: 'User statistics retrieved successfully',
                        activeUsers: userStats[0].activeUsers,
                        inactiveUsers: userStats[0].inactiveUsers,
                    });
                } catch (error) {
                    console.error('Error retrieving user statistics:', error);
                    res.status(500).json({ message: 'Error retrieving user statistics', error: error.message });
                }
            };


            // Filter and search files for admin
exports.filterFiles = async (req, res) => {
    const { userId, extension, page = 1, limit = 10 } = req.query;

    try {
        const offset = (page - 1) * limit;

        // Base query
        let query = `
            SELECT f.id, f.file_name, f.size, f.mimeType, u.name AS user_name 
            FROM files f
            LEFT JOIN users u ON f.user_id = u.id
            WHERE 1=1
        `;
        const queryParams = [];

        // Apply filters if provided
        if (userId) {
            query += ` AND f.user_id = ?`;
            queryParams.push(userId);
        }

        if (extension) {
            query += ` AND f.mimeType LIKE ?`;
            queryParams.push(`%${extension}`);
        }

        // Add pagination
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [files] = await db.query(query, queryParams);

        res.status(200).json({
            message: 'Files retrieved successfully',
            files,
            currentPage: page,
            pageSize: limit,
        });
    } catch (error) {
        console.error('Error filtering files:', error);
        res.status(500).json({ message: 'Error filtering files', error: error.message });
    }
};


// Download a file on behalf of a user
exports.downloadFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        // Retrieve file details
        const [fileDetails] = await db.query(
            `SELECT f.path, f.file_name, u.name AS user_name
             FROM files f
             LEFT JOIN users u ON f.user_id = u.id
             WHERE f.id = ?`,
            [fileId]
        );

        if (!fileDetails.length) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = fileDetails[0];

        // Send the file as a download
        res.download(file.path, file.file_name, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        console.error('Error fetching file for download:', error);
        res.status(500).json({ message: 'Error fetching file for download', error: error.message });
    }
};

            

        
    