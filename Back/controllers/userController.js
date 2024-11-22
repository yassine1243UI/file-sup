const db = require('../config/db');

exports.getUserInfo = async (req, res) => {
    const userId = req.user.user_id; 

    try {
        const [user] = await db.query(`
            SELECT id, name, email, role, total_storage, extra_storage 
            FROM users 
            WHERE id = ?
        `, [userId]);

        if (!user.length) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json(user[0]); 
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des informations utilisateur' });
    }
};
