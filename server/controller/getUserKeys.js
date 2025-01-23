// server/controller/getUserKeys.js

const UserModel = require('../models/UserModel');

async function getUserKeys(req, res) {
  try {
    const user = await UserModel.findById(req.params.userId)
      .select('signal');
    
    res.json({
      identityKey: user.signal.identityPublicKey,
      registrationId: user.signal.registrationId,
      signedPreKey: user.signal.signedPreKey,
      preKey: user.signal.preKeys[0] // Return first available prekey
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}

module.exports = getUserKeys;
