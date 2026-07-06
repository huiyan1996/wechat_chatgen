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

  const captureChatCanvas = async (options = {}) => {
    if (!import.meta.client) {
      return null
    }

    const chatPage = document.querySelector('#chatPage')
    const messageList = document.querySelector('#messageList')

    if (!chatPage) {
      return null
    }

    if (messageList) {
      messageList.style.maxHeight = 'unset'
    }

    try {
      const html2canvas = await loadHtml2Canvas()
      return await html2canvas(chatPage, {
        useCORS: true,
        ...options,
      })
    } finally {
      if (messageList) {
        messageList.style.maxHeight = '85vh'
      }
    }
  }

  const generatePreviewImage = async () => {
    try {
      const canvas = await captureChatCanvas()

      if (!canvas) {
        return
      }

      generatedImage.value = canvas.toDataURL('image/png')
      showImageModal.value = true
    } catch (error) {
      console.error('Image generation failed:', error)
      saveError.value = '图片生成失败，请重试'
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
  }
}
