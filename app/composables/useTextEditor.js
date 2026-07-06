export const useTextEditor = () => {
  const route = useRoute()
  const { user } = useAuth()

  const isLoading = ref(true)
  const isSaving = ref(false)
  const isGenerating = ref(false)
  const saveMessage = ref('')
  const saveError = ref('')
  const generatedImage = ref('')
  const showImageModal = ref(false)
  const chapterOptions = ref([])

  const form = reactive({
    genTitle: '新文本',
    author: '',
    nextChapter: '',
    textOnly: false,
  })

  const textContent = ref('')

  const loadChapterOptions = async () => {
    const response = await $fetch('/api/chapters')
    const currentId = route.params.id

    chapterOptions.value = response.chapters
      .filter((chapter) => chapter.id !== currentId)
      .map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        type: chapter.type,
      }))
  }

  const loadText = async () => {
    const id = route.params.id

    if (!id || id === 'new') {
      form.author = user.value?.name || '无名'
      isLoading.value = false
      await loadChapterOptions()
      return
    }

    isLoading.value = true
    saveError.value = ''

    try {
      const response = await $fetch(`/api/texts/${id}`)
      const text = response.text

      form.genTitle = text.genTitle
      form.author = text.author
      form.nextChapter = text.nextChapter || ''

      const firstBlock = text.chatList?.[0]
      textContent.value = firstBlock?.content || ''

      await loadChapterOptions()
    } catch (error) {
      saveError.value = error?.data?.statusMessage || 'Failed to load text.'
    } finally {
      isLoading.value = false
    }
  }

  const saveText = async () => {
    isSaving.value = true
    saveMessage.value = ''
    saveError.value = ''

    const payload = {
      genTitle: form.genTitle || '新文本',
      author: form.author || '无名',
      content: textContent.value,
      nextChapter: form.nextChapter || null,
    }

    try {
      const id = route.params.id

      if (!id || id === 'new') {
        const response = await $fetch('/api/texts', {
          method: 'POST',
          body: payload,
        })

        saveMessage.value = '添加成功!'
        await navigateTo(`/text/${response.text.id}`, { replace: true })
        return response.text
      }

      const response = await $fetch(`/api/texts/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      saveMessage.value = '编辑成功!'
      await loadChapterOptions()
      return response.text
    } catch (error) {
      saveError.value = error?.data?.statusMessage || 'Failed to save text.'
      return null
    } finally {
      isSaving.value = false
    }
  }

  const generatePreviewImage = async () => {
    if (!import.meta.client) {
      return
    }

    isGenerating.value = true

    try {
      const html2canvas = await loadHtml2Canvas()
      const tempContainer = document.createElement('div')

      tempContainer.style.width = '1200px'
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.style.padding = '40px'
      tempContainer.style.fontFamily = 'Arial, sans-serif'
      tempContainer.style.lineHeight = '1.6'
      tempContainer.style.color = '#333333'

      const title = form.genTitle || '无标题'
      const author = form.author || '无名'

      if (form.textOnly) {
        tempContainer.innerHTML = `
          <div style="font-size: 20px; text-align: left; max-width: 100%;">
            ${textContent.value}
          </div>
        `
      } else {
        tempContainer.innerHTML = `
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 36px; font-weight: bold; margin-bottom: 10px; color: #2c3e50;">${title}</h1>
            <p style="font-size: 18px; color: #7f8c8d; margin: 0;">作者: ${author}</p>
          </div>
          <div style="font-size: 20px; text-align: left; max-width: 100%;">
            ${textContent.value}
          </div>
        `
      }

      document.body.appendChild(tempContainer)

      const canvas = await html2canvas(tempContainer, {
        width: 1200,
        height: tempContainer.scrollHeight,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      document.body.removeChild(tempContainer)
      generatedImage.value = canvas.toDataURL('image/png')
      showImageModal.value = true
    } catch {
      saveError.value = '图片生成失败，请重试'
    } finally {
      isGenerating.value = false
    }
  }

  return {
    isLoading,
    isSaving,
    isGenerating,
    saveMessage,
    saveError,
    generatedImage,
    showImageModal,
    chapterOptions,
    form,
    textContent,
    loadText,
    saveText,
    generatePreviewImage,
  }
}
