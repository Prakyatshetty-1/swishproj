import express from 'express';
import { signup, login, logout, refreshAccessToken, saveOnboarding, googleSignIn, setPassword, getAllUsers } from '../controllers/authcon.js';
import { updateProfile } from '../controllers/profilecon.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/save-onboarding', saveOnboarding);
router.post('/google-signin', googleSignIn);
router.post('/set-password', setPassword);
router.post('/update-profile', updateProfile);
router.get('/users', getAllUsers);

export default router;
