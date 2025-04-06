const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

async function setup2FA (req, res) {
    try{
        // console.log("The req.user is : ", req.user);
        const user = req.user;

        var secret = speakeasy.generateSecret();
        // console.log("Secret object: ", secret);
        user.twoFactorSecret = secret.base32;
        await user.save();

        const url = speakeasy.otpauthURL({
            secret: secret.base32,
            label:  `${req.user.name}`,
            issuer: "www.cypher.com",
            encoding: "base32",
        });

        const qrImageUrl = await qrcode.toDataURL(url);

        return res.status(200).json({
            secret: secret.base32,
            qrCode: qrImageUrl,
        });

    }catch (error) {
        return res.status(500).json({ 
            error: "Error setting up 2FA", 
            message: error
        });
    }
}

module.exports = setup2FA;
