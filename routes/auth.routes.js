const router = require('express').Router();
const { register, login, whoami, authenticateUser } = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.post('/register', register);
router.post('/login', login);
router.get('/whoami', restrict, whoami);
router.get('/authenticate-user', authenticateUser);

module.exports = router;
