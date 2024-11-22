const express = require('express');
const { getUserInfo } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); 

const router = express.Router();

router.get('/me', authMiddleware, getUserInfo);

module.exports = router;
