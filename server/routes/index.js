const express = require('express');
const registerUser = require('../controller/registerUser');
const checkEmail = require('../controller/checkEmail');
const checkPassword = require('../controller/checkPassword');
const userDetails = require('../controller/userDetails');
const logout = require('../controller/logout');
const updateUserDetails = require('../controller/updateUserDetails');
const searchUser = require('../controller/searchUser');
const getPublicKey = require('../controller/getPublicKey');
const setup2FA = require('../controller/setup2FA');
const verify2FA = require('../controller/verify2FA');
const reset2FA = require('../controller/reset2FA');
const authenticateJWT = require('../middleware/auth');
const authWithGoogle = require('../controller/authWithGoogle');

const router = express.Router();

// create user api
router.post('/register', registerUser);
// check user email
router.post('/email', checkEmail);
// check user password
router.post('/password', checkPassword);
// login user detais
router.get('/user-details', userDetails);
// logout user
router.get('/logout', logout);
// update user details
router.post('/update-user', updateUserDetails);
// search user
router.post('/search-user', searchUser);
// Get public key
router.get('/get-public-key', getPublicKey);
// 2FA setup
router.post('/2fa/setup', authenticateJWT, setup2FA);
// 2FA verify 
router.post('/2fa/verify', authenticateJWT, verify2FA);
// 2FA reset
router.post('/2fa/reset', authenticateJWT, reset2FA);
// Google auth
router.post('/auth/google', authWithGoogle);

module.exports = router;