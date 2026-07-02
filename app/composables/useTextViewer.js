const SCROLL_KEY = 'textViewScroll'

export const useTextViewer = () => {
  const route = useRoute()

  const isLoading = ref(true)
  const loadError = ref('')
  const genTitle = ref('加载中...')
  const author = ref('加载中...')
  const textContent = ref('')
  const nextChapter = ref(null)

  const recordId = computed(() => route.params.id)

  const nextChapterPath = computed(() => {
    if (!nextChapter.value?.id) {
      return ''
    }

    if (nextChapter.value.type === 'text') {
      return `/view/text/${nextChapter.value.id}`
    }

    return `/view/chat/${nextChapter.value.id}`
  })

  const saveScrollPosition = () => {
    if (!import.meta.client || !recordId.value) {
      return
    }

    try {
      const existing = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}')
      existing[recordId.value] = {
        scrollTop: window.scrollY,
        timestamp: Date.now(),
      }
      localStorage.setItem(SCROLL_KEY, JSON.stringify(existing))
    } catch {
      localStorage.removeItem(SCROLL_KEY)
    }
  }

  const restoreScrollPosition = () => {
    if (!import.meta.client || !recordId.value) {
      return
    }

    try {
      const existing = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}')
      const saved = existing[recordId.value]?.scrollTop

      if (saved > 0) {
        setTimeout(() => {
          window.scrollTo({ top: saved })
        }, 100)
      }
    } catch {
      localStorage.removeItem(SCROLL_KEY)
    }
  }

  const loadText = async () => {
    isLoading.value = true
    loadError.value = ''

    try {
      const response = await $fetch(`/api/public/records/${recordId.value}`)
      const record = response.record

      if (record.type !== 'text') {
        throw new Error('This record is not a text document.')
      }

      genTitle.value = record.genTitle || '无标题'
      author.value = record.author || '无名'
      nextChapter.value = record.nextChapter

      const firstBlock = record.chatList?.[0]
      textContent.value = firstBlock?.content || ''

      if (import.meta.client) {
        useHead({ title: genTitle.value })
      }

      await nextTick()
      restoreScrollPosition()
    } catch (error) {
      loadError.value = error?.data?.statusMessage || error?.message || 'Failed to load text.'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (import.meta.client) {
      window.addEventListener('scroll', saveScrollPosition)
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('scroll', saveScrollPosition)
    }
  })

  return {
    isLoading,
    loadError,
    genTitle,
    author,
    textContent,
    nextChapter,
    nextChapterPath,
    loadText,
  }
}
