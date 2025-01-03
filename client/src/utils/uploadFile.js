const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`

const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'Cypher-file')

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    })

    return response.json()
}

export default uploadFile;