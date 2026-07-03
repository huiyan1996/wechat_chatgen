export const useChatEditor = (chatId) => {
  const route = useRoute()
  const { user } = useAuth()
  const { uploadImage, defaultImg, uploadError, isUploading, resetFileInput } = useChatUpload()

  const isLoading = ref(true)
  const isSaving = ref(false)
  const saveMessage = ref('')
  const saveError = ref('')
  const generatedImage = ref('')
  const showImageModal = ref(false)
  const isGeneratingPreview = ref(false)
  const isDownloadingPng = ref(false)
  const downloadPngError = ref('')
  const generateError = ref('')
  const chapterOptions = ref([])

  const form = reactive({
    genTitle: '捡手机文学',
    author: '',
    chatName: '',
    nextChapter: '',
    isPrivate: false,
  })

  const userList = ref([])
  const chatList = ref([])

  const characterName = ref('')
  const characterImg = ref('')
  const canAddCharacter = ref(false)

  const messageSide = ref('left')
  const selectedCharacterIndex = ref(0)
  const chatContent = ref('')
  const messageImg = ref('')
  const canAddMessageImg = ref(false)
  const isSticker = ref(false)
  const centerImg = ref('')
  const canAddCenterImg = ref(false)
  const timeContent = ref('')
  const timepassContent = ref('')
  const callContent = ref('')
  const callType = ref('phone')

  const editImgIndex = ref(null)
  const editImgUrl = ref('')
  const showEditImgBlock = ref(false)

  const chatType = computed(() => (form.isPrivate ? 'private' : 'group'))

  const loadChapterOptions = async () => {
    const response = await $fetch('/api/chapters')
    const currentId = chatId?.value || route.params.id

    chapterOptions.value = response.chapters
      .filter((chapter) => chapter.id !== currentId)
      .map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
      }))
  }

  const loadChat = async () => {
    const id = chatId?.value || route.params.id

    if (!id || id === 'new') {
      form.author = user.value?.name || '无名'
      isLoading.value = false
      await loadChapterOptions()
      return
    }

    isLoading.value = true

    try {
      const response = await $fetch(`/api/chats/${id}`)
      const chat = response.chat

      form.genTitle = chat.genTitle
      form.author = chat.author
      form.chatName = chat.chatName
      form.nextChapter = chat.nextChapter || ''
      form.isPrivate = chat.chatType === 'private'
      userList.value = chat.userList || []
      chatList.value = chat.chatList || []

      await loadChapterOptions()
    } catch (error) {
      saveError.value = error?.data?.statusMessage || 'Failed to load chat.'
    } finally {
      isLoading.value = false
    }
  }

  const saveChat = async () => {
    isSaving.value = true
    saveMessage.value = ''
    saveError.value = ''

    const payload = {
      genTitle: form.genTitle || '捡手机文学',
      author: form.author || '无名',
      chatName: form.chatName,
      chatType: chatType.value,
      userList: userList.value,
      chatList: chatList.value,
      nextChapter: form.nextChapter || null,
    }

    try {
      const id = chatId?.value || route.params.id

      if (!id || id === 'new') {
        const response = await $fetch('/api/chats', {
          method: 'POST',
          body: payload,
        })

        saveMessage.value = '添加成功!'
        await navigateTo(`/chat/${response.chat.id}`, { replace: true })
        return response.chat
      }

      const response = await $fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      saveMessage.value = '编辑成功!'
      await loadChapterOptions()
      return response.chat
    } catch (error) {
      saveError.value = error?.data?.statusMessage || 'Failed to save chat.'
      return null
    } finally {
      isSaving.value = false
    }
  }

  const handleCharacterImageChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const url = await uploadImage(file)

    if (url) {
      characterImg.value = url
      canAddCharacter.value = true
      return
    }

    characterImg.value = ''
    canAddCharacter.value = false
    resetFileInput(event)
  }

  const addCharacter = (name, img, imageInputEvent) => {
    const nextName = (name || characterName.value || '').trim()
    const nextImg = img || characterImg.value

    if (!nextName || !nextImg) {
      return
    }

    userList.value.push({
      name: nextName,
      img: nextImg,
    })

    characterName.value = ''
    characterImg.value = ''
    canAddCharacter.value = false
    selectedCharacterIndex.value = userList.value.length - 1
    resetFileInput(imageInputEvent)
  }

  const deleteCharacter = (index) => {
    userList.value.splice(index, 1)

    if (selectedCharacterIndex.value >= userList.value.length) {
      selectedCharacterIndex.value = Math.max(userList.value.length - 1, 0)
    }
  }

  const startEditCharacterImage = (index) => {
    editImgIndex.value = index
    editImgUrl.value = userList.value[index]?.img || ''
    showEditImgBlock.value = true
  }

  const applyCharacterImageEdit = () => {
    if (editImgIndex.value === null || !editImgUrl.value) {
      return
    }

    const oldImg = userList.value[editImgIndex.value].img
    userList.value[editImgIndex.value].img = editImgUrl.value

    chatList.value = chatList.value.map((message) => {
      if (message.user_img === oldImg) {
        return { ...message, user_img: editImgUrl.value }
      }

      return message
    })

    editImgIndex.value = null
    editImgUrl.value = ''
    showEditImgBlock.value = false
  }

  const getSelectedCharacter = () => {
    return userList.value[selectedCharacterIndex.value]
  }

  const addTextMessage = (side, name, text, img) => {
    const content = (text ?? chatContent.value).trim()
    const character = getSelectedCharacter()

    if (!content || !character) {
      return
    }

    const userSide = side || messageSide.value
    const userName = name || character.name
    const userImg = img || character.img

    chatList.value.push({
      side: userSide,
      name: userName,
      user_img: userImg,
      type: 'text',
      content,
    })

    chatContent.value = ''
  }

  const handleMessageImageChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const url = await uploadImage(file)

    if (url) {
      messageImg.value = url
      canAddMessageImg.value = true
      return
    }

    messageImg.value = ''
    canAddMessageImg.value = false
    resetFileInput(event)
  }

  const addImageMessage = (side, name, text, img, sticker, imageInputEvent) => {
    const character = getSelectedCharacter()
    const imageUrl = text || messageImg.value

    if (!imageUrl || !character) {
      return
    }

    const userSide = side || messageSide.value
    const userName = name || character.name
    const userImg = img || character.img
    const isStickerMessage = sticker ?? isSticker.value

    chatList.value.push({
      side: userSide,
      name: userName,
      user_img: userImg,
      type: 'img',
      isSticker: Boolean(isStickerMessage),
      content: imageUrl,
    })

    messageImg.value = ''
    isSticker.value = false
    canAddMessageImg.value = false
    resetFileInput(imageInputEvent)
  }

  const handleCenterImageChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const url = await uploadImage(file)

    if (url) {
      centerImg.value = url
      canAddCenterImg.value = true
      return
    }

    centerImg.value = ''
    canAddCenterImg.value = false
    resetFileInput(event)
  }

  const addCenterImage = (img, imageInputEvent) => {
    const imageUrl = img || centerImg.value

    if (!imageUrl) {
      return
    }

    chatList.value.push({
      type: 'imgCenter',
      content: imageUrl,
    })

    centerImg.value = ''
    canAddCenterImg.value = false
    resetFileInput(imageInputEvent)
  }

  const addTimeMessage = (text) => {
    const content = (text ?? timeContent.value).trim()

    if (!content) {
      return
    }

    chatList.value.push({
      type: 'time',
      content,
    })

    timeContent.value = ''
  }

  const addTimepassMessage = (text) => {
    chatList.value.push({
      type: 'timepass',
      content: text ?? timepassContent.value,
    })

    timepassContent.value = ''
  }

  const addCallMessage = (side, name, text, img, selectedCallType) => {
    const content = (text ?? callContent.value).trim()
    const character = getSelectedCharacter()

    if (!content || !character) {
      return
    }

    chatList.value.push({
      side: side || messageSide.value,
      name: name || character.name,
      user_img: img || character.img,
      type: 'call',
      callType: selectedCallType || callType.value,
      content,
    })

    callContent.value = ''
  }

  const deleteMessage = (index) => {
    chatList.value.splice(index, 1)
  }

  const changeMessageSide = (index) => {
    const message = chatList.value[index]

    if (!message?.side) {
      return
    }

    message.side = message.side === 'left' ? 'right' : 'left'
  }

  const updateMessageContent = (index, content) => {
    if (chatList.value[index]?.type === 'text') {
      chatList.value[index].content = content
    }
  }

  const resolveRefElement = (refOrElement) => {
    if (!refOrElement) {
      return null
    }

    if (refOrElement instanceof HTMLElement) {
      return refOrElement
    }

    if (refOrElement.value instanceof HTMLElement) {
      return refOrElement.value
    }

    return null
  }

  const applyCaptureLayout = (root) => {
    if (!root) {
      return
    }

    const main = root.querySelector('main')

    if (main) {
      main.style.maxHeight = 'none'
      main.style.minHeight = '0'
      main.style.overflow = 'visible'
      main.style.paddingTop = '0'
    }

    root.querySelectorAll('.message-list').forEach((list) => {
      list.style.maxHeight = 'none'
      list.style.overflow = 'visible'
    })

    root.querySelectorAll('.msg-item').forEach((item) => {
      item.style.marginTop = '0'
      item.style.paddingTop = '8px'
      item.style.boxSizing = 'border-box'
    })

    root.querySelectorAll('.msg-meta').forEach((item) => {
      item.style.paddingTop = '4px'
    })

    const firstMsgItem = root.querySelector('.message-list > .msg-item')

    if (firstMsgItem) {
      firstMsgItem.style.paddingTop = '0'
    }

    root.querySelectorAll('.message-item > div:not(.message-bubble):not(.avatar)').forEach((body) => {
      body.style.display = 'flex'
      body.style.flexDirection = 'column'
      body.style.gap = '0'
      body.style.lineHeight = '0'
    })

    root.querySelectorAll('.message-bubble, .time-badge').forEach((el) => {
      el.style.marginTop = '0px'
      el.style.marginBottom = '0px'
      el.style.verticalAlign = 'top'
    })

    root.querySelectorAll('.message-bubble').forEach((bubble) => {
      bubble.style.display = 'block'
      bubble.style.lineHeight = '1.35'
      bubble.style.paddingTop = '6px'
      bubble.style.paddingBottom = '6px'

      if (!bubble.querySelector('img, svg') && bubble.childNodes.length <= 1) {
        bubble.textContent = (bubble.textContent || '').trim()
      }
    })

    root.querySelectorAll('.badge-block, .imgCenter-badge').forEach((block) => {
      block.style.margin = '0 auto'
      block.style.paddingTop = '0'
      block.style.paddingBottom = '0'
    })

    root.querySelectorAll('.leftName').forEach((name) => {
      name.style.marginTop = '0'
      name.style.marginBottom = '2px'
      name.style.lineHeight = '14px'
      name.style.height = '14px'
      name.style.position = ''
      name.style.top = ''
    })

    root.querySelectorAll('.message-bubble[contenteditable]').forEach((bubble) => {
      bubble.removeAttribute('contenteditable')
      bubble.style.userSelect = 'none'
    })
  }

  const resetCaptureLayout = (root) => {
    if (!root) {
      return
    }

    const main = root.querySelector('main')

    if (main) {
      main.style.maxHeight = ''
      main.style.minHeight = ''
      main.style.overflow = ''
      main.style.paddingTop = ''
    }

    root.querySelectorAll('.message-list').forEach((list) => {
      list.style.maxHeight = ''
      list.style.overflow = ''
    })

    root.querySelectorAll('.msg-item').forEach((item) => {
      item.style.marginTop = ''
      item.style.paddingTop = ''
      item.style.boxSizing = ''
    })

    root.querySelectorAll('.msg-meta').forEach((item) => {
      item.style.paddingTop = ''
    })

    root.querySelectorAll('.message-item > div:not(.message-bubble):not(.avatar)').forEach((body) => {
      body.style.display = ''
      body.style.flexDirection = ''
      body.style.gap = ''
      body.style.lineHeight = ''
    })

    root.querySelectorAll('.badge-block, .imgCenter-badge').forEach((block) => {
      block.style.margin = ''
      block.style.paddingTop = ''
      block.style.paddingBottom = ''
    })

    root.querySelectorAll('.leftName').forEach((name) => {
      name.style.marginTop = ''
      name.style.marginBottom = ''
      name.style.lineHeight = ''
      name.style.height = ''
      name.style.position = ''
      name.style.top = ''
    })

    root.querySelectorAll('.message-bubble, .time-badge').forEach((el) => {
      el.style.marginTop = ''
      el.style.marginBottom = ''
      el.style.verticalAlign = ''
    })

    root.querySelectorAll('.message-bubble').forEach((bubble) => {
      bubble.style.display = ''
      bubble.style.lineHeight = ''
      bubble.style.paddingTop = ''
      bubble.style.paddingBottom = ''
      bubble.style.userSelect = ''
    })
  }

  const captureChatCanvas = async (chatPreview, options = {}) => {
    if (!import.meta.client || !chatPreview) {
      return null
    }

    const chatPage = resolveRefElement(chatPreview.chatPageRef)

    if (!chatPage) {
      return null
    }

    chatPage.classList.add('is-capturing')
    applyCaptureLayout(chatPage)

    try {
      const { default: html2canvas } = await import('html2canvas')
      const { onclone: userOnclone, ...html2canvasOptions } = options

      return await html2canvas(chatPage, {
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        ...html2canvasOptions,
        onclone: (clonedDoc, element) => {
          const clonedRoot = element?.classList?.contains('chat-page')
            ? element
            : clonedDoc.querySelector('.chat-page')

          if (clonedRoot) {
            applyCaptureLayout(clonedRoot)
          }

          userOnclone?.(clonedDoc, element)
        },
      })
    } finally {
      chatPage.classList.remove('is-capturing')
      resetCaptureLayout(chatPage)
    }
  }

  const generatePreviewImage = async (chatPreview) => {
    isGeneratingPreview.value = true
    generateError.value = ''

    try {
      const canvas = await captureChatCanvas(chatPreview)

      if (!canvas) {
        return
      }

      generatedImage.value = canvas.toDataURL('image/png')
      showImageModal.value = true
    } catch (error) {
      console.error('Image generation failed:', error)
      generateError.value = '图片生成失败，请重试'
    } finally {
      isGeneratingPreview.value = false
    }
  }

  const downloadPreviewPng = async (chatPreview) => {
    isDownloadingPng.value = true
    downloadPngError.value = ''

    try {
      const canvas = await captureChatCanvas(chatPreview, { scale: 3 })

      if (!canvas) {
        return
      }

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result)
            return
          }

          reject(new Error('Failed to create PNG blob'))
        }, 'image/png')
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'render.png'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PNG download failed:', error)
      downloadPngError.value = 'PNG 下载失败，请重试'
    } finally {
      isDownloadingPng.value = false
    }
  }

  return {
    isLoading,
    isSaving,
    saveMessage,
    saveError,
    uploadError,
    isUploading,
    generatedImage,
    showImageModal,
    isGeneratingPreview,
    isDownloadingPng,
    downloadPngError,
    generateError,
    chapterOptions,
    form,
    userList,
    chatList,
    characterName,
    characterImg,
    messageImg,
    centerImg,
    canAddCharacter,
    messageSide,
    selectedCharacterIndex,
    chatContent,
    canAddMessageImg,
    isSticker,
    canAddCenterImg,
    timeContent,
    timepassContent,
    callContent,
    callType,
    editImgUrl,
    showEditImgBlock,
    chatType,
    defaultImg,
    loadChat,
    saveChat,
    handleCharacterImageChange,
    addCharacter,
    deleteCharacter,
    startEditCharacterImage,
    applyCharacterImageEdit,
    addTextMessage,
    handleMessageImageChange,
    addImageMessage,
    handleCenterImageChange,
    addCenterImage,
    addTimeMessage,
    addTimepassMessage,
    addCallMessage,
    deleteMessage,
    changeMessageSide,
    updateMessageContent,
    generatePreviewImage,
    downloadPreviewPng,
  }
}
