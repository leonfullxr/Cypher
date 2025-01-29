const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');

async function verify2FA (req, res) {
    try{
        const { token } = req.body;
        const user = req.user;

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32", 
            token,
        });

        if (verified){
            user.isMfaActive = true;
            await user.save();

            const newToken = jwt.sign(
                { id: user._id, email: user.email, twofa: true }, 
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
            );

            res.status(200).json({
                message: "2FA successful", 
                token: newToken,
                user: { 
                    _id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    isMfaActive: user.isMfaActive,
                    profile_pic: user.profile_pic,
                }
            });

        } else{
            res.status(400).json({message: "Invalid 2FA token"});
        }
    }catch (error) {
        return res.status(500).json({
          message: "Error verifying 2FA",
          error
        });
    } 
}

module.exports = verify2FA;
