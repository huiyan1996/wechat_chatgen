const PROGRESS_KEY = 'viewLiveProgress'

export const useChatViewer = () => {
  const route = useRoute()

  const isLoading = ref(true)
  const loadError = ref('')
  const chatName = ref('')
  const author = ref('')
  const chatType = ref('group')
  const allMessages = ref([])
  const revealedMessages = ref([])
  const currentIndex = ref(0)
  const isChatting = ref(true)
  const nextChapter = ref(null)
  const viewImageSrc = ref('')
  const showImageModal = ref(false)
  const playerRef = ref(null)

  const recordId = computed(() => route.params.id)

  const showNextChapter = computed(() => {
    return !isChatting.value && Boolean(nextChapter.value?.id)
  })

  const nextChapterPath = computed(() => {
    if (!nextChapter.value?.id) {
      return ''
    }

    if (nextChapter.value.type === 'text') {
      return `/view/text/${nextChapter.value.id}`
    }

    return `/view/chat/${nextChapter.value.id}`
  })

  const saveProgress = () => {
    if (!import.meta.client || !recordId.value) {
      return
    }

    try {
      const existing = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
      existing[recordId.value] = {
        index: currentIndex.value,
        timestamp: Date.now(),
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(existing))
    } catch {
      localStorage.removeItem(PROGRESS_KEY)
    }
  }

  const getSavedIndex = () => {
    if (!import.meta.client || !recordId.value) {
      return 0
    }

    try {
      const existing = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
      const saved = existing[recordId.value]?.index || 0

      if (saved > 0 && saved < allMessages.value.length) {
        return saved
      }
    } catch {
      localStorage.removeItem(PROGRESS_KEY)
    }

    return 0
  }

  const revealMessage = (message) => {
    revealedMessages.value.push({ ...message })
  }

  const scrollToBottom = async () => {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(resolve))
    playerRef.value?.scrollToBottom()
  }

  const restoreSavedProgress = (targetIndex) => {
    if (targetIndex <= 0) {
      return
    }

    revealedMessages.value = allMessages.value
      .slice(0, targetIndex)
      .map((message) => ({ ...message }))
    currentIndex.value = targetIndex
  }

  const handleClickChat = async () => {
    if (currentIndex.value < allMessages.value.length) {
      revealMessage(allMessages.value[currentIndex.value])
      currentIndex.value += 1
      await scrollToBottom()
      saveProgress()
      return
    }

    if (!isChatting.value) {
      return
    }

    revealMessage({ type: 'time', content: '结束' })
    revealMessage({ type: 'time', content: `作者: ${author.value || '无名'}` })
    isChatting.value = false
    await scrollToBottom()
    saveProgress()
  }

  const handleViewImage = (src) => {
    viewImageSrc.value = src
    showImageModal.value = true
  }

  const loadChat = async () => {
    isLoading.value = true
    loadError.value = ''

    let restoredIndex = 0

    try {
      const response = await $fetch(`/api/public/records/${recordId.value}`)
      const record = response.record

      if (record.type === 'text') {
        throw new Error('This record is a text document.')
      }

      chatName.value = record.chatName || record.genTitle || '小说名字'
      author.value = record.author || '无名'
      chatType.value = record.chatType || 'group'
      allMessages.value = record.chatList || []
      nextChapter.value = record.nextChapter
      revealedMessages.value = []
      currentIndex.value = 0
      isChatting.value = true

      restoredIndex = getSavedIndex()
      restoreSavedProgress(restoredIndex)
    } catch (error) {
      loadError.value = error?.data?.statusMessage || error?.message || 'Failed to load chat.'
    } finally {
      isLoading.value = false

      if (restoredIndex > 0) {
        await scrollToBottom()
      }
    }
  }

  return {
    isLoading,
    loadError,
    chatName,
    chatType,
    revealedMessages,
    showNextChapter,
    nextChapterPath,
    viewImageSrc,
    showImageModal,
    playerRef,
    handleClickChat,
    handleViewImage,
    loadChat,
  }
}
