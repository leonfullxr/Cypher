const UserModel = require('../models/UserModel');

const getPublicKey = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'El ID de usuario es requerido.' });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (!user.publicKey) {
            return res.status(400).json({ error: 'El usuario no tiene una clave pública registrada.' });
        }

        return res.status(200).json({ publicKey: user.publicKey });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener la clave pública.' });
    }
};

module.exports = getPublicKey;
