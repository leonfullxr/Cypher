const { OAuth2Client } = require('google-auth-library');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authWithGoogle(req, res) {
    try {
        const { credential, publicKey, encryptedPrivateKey } = req.body;
        console.log('[Google Auth] Request received'); ///

        if (!credential) {
            console.log('[Google Auth] Missing credential'); ////
            return res.status(400).json({ message: 'Missing Google credential', error: true });
        }

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        console.log('[Google Auth] Token verified'); ///

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        console.log('[Google Auth] Payload:', payload); ///

        let user = await UserModel.findOne({ googleId });
        console.log('[Google Auth] Found user by Google ID:', !!user); ///

        if (!user) {
            // fallback: check if user exists by email (registered manually)
            user = await UserModel.findOne({ email });
            console.log('[Google Auth] Found user by email:', !!user); ///

            if (!user) {
                // User doesn't exist: create new user (registration)
                if (!publicKey || !encryptedPrivateKey) {
                    console.log('[Google Auth] Missing keys for registration'); ///
                    return res.status(400).json({
                        message: 'Missing publicKey or encryptedPrivateKey for new user',
                        error: true
                    });
                }
    
                user = new UserModel({
                    name,
                    email,
                    profile_pic: picture || "",
                    googleId,
                    publicKey,
                    encryptedPrivateKey,
                    isMfaActive: false
                });
    
                await user.save();
                console.log('[Google Auth] New user created'); ///
            }
            else{
                console.log('[Google Auth] Email already registered manually'); ///
                // User exists (registered manually)
                return res.status(400).json({
                    message: "This email is already registered. Please log in with your password.",
                    error: true
                });
            }
        }

        // Generate our own token
        const tokenData = {
            id: user._id,
            email: user.email,
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log('[Google Auth] Token generated'); ///

        const cookiesOptions = {
            httpOnly: true,
            secure: true
        }

        return res.cookie('token', token, cookiesOptions).status(200).json({
            message: 'Authentication successful',
            token : token,
            encryptedPrivateKey: user.encryptedPrivateKey,
            isMfaActive: user.isMfaActive,
            success: true
        });

    } catch (error) {
        console.error('[Google Auth] Error:', error); ///
        return res.status(500).json({
            message: error.message || 'Authentication failed',
            error: true,
        });
    }
}

module.exports = authWithGoogle;