const express = require('express');
const { uploadFile, listFiles, downloadFile, deleteFile } = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/multerConfig');
const verifyPayment = require('../middleware/verifyPayment');
const router = express.Router();

router.post('/upload', authMiddleware,verifyPayment, upload.single('file'), uploadFile);
router.get('/', authMiddleware, verifyPayment,listFiles);
router.get('/:fileId', authMiddleware, downloadFile);
router.delete('/:fileId', authMiddleware,verifyPayment, deleteFile);

module.exports = router;
