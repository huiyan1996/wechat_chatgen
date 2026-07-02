const DEFAULT_IMG = '/img/icon/person.svg'

export const useChatUpload = () => {
  const config = useRuntimeConfig()
  const isUploading = ref(false)
  const uploadError = ref('')

  const uploadImage = async (file) => {
    if (!file) {
      return null
    }

    const cloudName = config.public.cloudinaryCloudName
    const uploadPreset = config.public.cloudinaryUploadPreset

    isUploading.value = true
    uploadError.value = ''

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('cloud_name', cloudName)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )

      const data = await response.json()

      if (data?.secure_url) {
        return data.secure_url
      }

      throw new Error(data?.error?.message || 'Upload failed.')
    } catch (error) {
      uploadError.value = error?.message || 'Upload error.'
      return null
    } finally {
      isUploading.value = false
    }
  }

  const resetFileInput = (event) => {
    if (event?.target) {
      event.target.value = ''
    }
  }

  return {
    isUploading,
    uploadError,
    uploadImage,
    resetFileInput,
    defaultImg: DEFAULT_IMG,
  }
}
