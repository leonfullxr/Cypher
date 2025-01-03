async function logout(request, response){
    try {
        const cookiesOptions = {
            httpOnly: true,
            secure: true
        }

        return response.cookie('token', '', cookiesOptions).status(200).json({
            message: 'Password verified, logout successful',
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }

}

module.exports = logout;