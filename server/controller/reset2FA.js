
async function reset2FA (req, res) {
    try{
        const user = req.user;
        user.twoFactorSecret = "";
        user.isMfaActive = false;
        await user.save();
        return res.status(200).json({message: "2FA reset successful"});
    
    }catch (error) {
        return res.status(500).json({ 
            error: "Error reseting 2FA",
            message: error
        });
    } 
}

module.exports = reset2FA;