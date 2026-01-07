import express from 'express';
import { signup, login, logout, refreshAccessToken, saveOnboarding, googleSignIn, setPassword } from '../controllers/authcon.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/save-onboarding', saveOnboarding);
router.post('/google-signin', googleSignIn);
router.post('/set-password', setPassword);

export default router;
