const mysql = require('mysql2');
require('dotenv').config(); // Charge les variables d'environnement

// Création du pool de connexion
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Fonction de debug pour vérifier les variables d'environnement
console.log('DEBUG: Vérification des variables d\'environnement...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : 'Non défini');
console.log('DB_NAME:', process.env.DB_NAME);

// Vérification de la connexion à la base de données
(async () => {
    try {
        console.log('DEBUG: Test de connexion à la base de données...');
        const [rows] = await pool.promise().query('SELECT 1 + 1 AS result');
        console.log('DEBUG: Connexion réussie à la base de données. Résultat du test:', rows[0].result);
    } catch (error) {
        console.error('ERREUR: Impossible de se connecter à la base de données.');
        console.error('Détails de l\'erreur:', error.message);
    }
})();

// Export du pool avec support async/await
module.exports = pool.promise();
