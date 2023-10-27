// media.routes.js
const router = require('express').Router();
const { image } = require('../libs/multer');
const { imagekit, handleUpdateProfile } = require('../controllers/media.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.post('/profile/update/:id', image.single('profile_picture'), imagekit, handleUpdateProfile);

module.exports = router;
