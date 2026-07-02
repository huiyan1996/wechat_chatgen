<template>
  <div class="w-full">
    <div
      v-if="isLoading"
      class="loading-overlay"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
    </div>

    <div
      v-else-if="loadError"
      class="flex min-h-screen items-center justify-center p-6"
    >
      <p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ loadError }}
      </p>
    </div>

    <ChatViewPlayer
      v-else
      ref="playerRef"
      :chat-name="chatName"
      :chat-type="chatType"
      :revealed-messages="revealedMessages"
      :show-next-chapter="showNextChapter"
      :next-chapter-path="nextChapterPath"
      @click-chat="handleClickChat"
      @view-image="handleViewImage"
    />

    <div
      v-if="showImageModal"
      class="view-image-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      @click="showImageModal = false"
    >
      <img
        :src="viewImageSrc"
        alt="Preview image"
      >
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'view',
})

const {
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
} = useChatViewer()

onMounted(() => {
  loadChat()
})
</script>
