<template>
  <section>
    <div
      v-if="isLoading"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600"
    >
      加载中...
    </div>

    <div
      v-else
      class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
    >
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/listing"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← 回到目录
          </NuxtLink>

          <button
            type="button"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSaving"
            aria-label="Save chat"
            @click="handleSave"
          >
            {{ isSaving ? '保存中...' : '保存记录' }}
          </button>

          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            aria-label="Generate preview image"
            @click="handleGenerate"
          >
            生成
          </button>
        </div>

        <p
          v-if="saveMessage"
          class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
          role="status"
        >
          {{ saveMessage }}
        </p>

        <p
          v-if="saveError"
          class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {{ saveError }}
        </p>

        <p
          v-if="uploadError"
          class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {{ uploadError }}
        </p>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">
            设定
          </h2>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label
                for="genTitle"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                标题
              </label>
              <input
                id="genTitle"
                v-model="form.genTitle"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="标题"
              >
            </div>

            <div>
              <label
                for="author"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                作者
              </label>
              <input
                id="author"
                v-model="form.author"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="作者名称"
              >
            </div>

            <div class="md:col-span-2">
              <label
                for="nextChapter"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                下个章节
              </label>
              <select
                id="nextChapter"
                v-model="form.nextChapter"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">
                  选择下个章节...
                </option>
                <option
                  v-for="chapter in chapterOptions"
                  :key="chapter.id"
                  :value="chapter.id"
                >
                  {{ chapter.title }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">
            对话初始设定
          </h2>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-700">群聊</span>
              <label class="relative inline-flex cursor-pointer items-center">
                <input
                  v-model="form.isPrivate"
                  type="checkbox"
                  class="peer sr-only"
                  aria-label="Toggle private chat"
                >
                <span class="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
              </label>
              <span class="text-sm text-slate-700">私聊</span>
            </div>

            <div>
              <label
                for="chatName"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                对话/群聊名称
              </label>
              <input
                id="chatName"
                v-model="form.chatName"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="First Kanaphan"
              >
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">
            角色
          </h2>

          <div class="space-y-4">
            <div>
              <label
                for="characterName"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                用户名
              </label>
              <input
                id="characterName"
                v-model="characterName"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="用户名"
              >
            </div>

            <div>
              <label
                for="characterImage"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                头像
              </label>
              <input
                id="characterImage"
                type="file"
                accept="image/*"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
                @change="handleCharacterImageInput"
              >
              <img
                v-if="characterImg"
                :src="characterImg"
                alt="Character preview"
                class="mt-3 h-20 w-20 rounded-lg border border-slate-200 object-cover"
              >
            </div>

            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canAddCharacter || isUploading"
              aria-label="Add character"
              @click="handleAddCharacter"
            >
              添加
            </button>

            <div
              v-if="userList.length === 0"
              class="text-sm text-slate-500"
            >
              ----- 请先添加角色 -----
            </div>

            <div
              v-else
              class="flex flex-wrap gap-3"
            >
              <div
                v-for="(character, index) in userList"
                :key="`${character.name}-${index}`"
                class="relative rounded-lg border border-slate-200 p-3"
              >
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs text-white"
                  aria-label="Delete character"
                  @click="deleteCharacter(index)"
                >
                  x
                </button>

                <label class="flex cursor-pointer items-center gap-2 pr-5">
                  <input
                    v-model="selectedCharacterIndex"
                    type="radio"
                    name="charOpt"
                    :value="index"
                  >
                  <img
                    :src="character.img"
                    class="h-12 w-12 rounded object-cover"
                    alt="Character avatar"
                  >
                  <span class="text-sm text-slate-700">{{ character.name }}</span>
                  <button
                    type="button"
                    class="text-sm text-slate-500"
                    aria-label="Edit character image"
                    @click="startEditCharacterImage(index)"
                  >
                    ✎
                  </button>
                </label>
              </div>
            </div>

            <div
              v-if="showEditImgBlock"
              class="flex gap-2"
            >
              <input
                v-model="editImgUrl"
                type="text"
                class="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="图片链接"
              >
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                @click="applyCharacterImageEdit"
              >
                编辑
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">
            添加对话
          </h2>

          <div class="space-y-5">
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  v-model="messageSide"
                  type="radio"
                  value="left"
                  name="userOpt"
                >
                别人
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  v-model="messageSide"
                  type="radio"
                  value="right"
                  name="userOpt"
                >
                自己
              </label>
            </div>

            <div>
              <label
                for="chatContent"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                信息
              </label>
              <input
                id="chatContent"
                v-model="chatContent"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="输入信息"
                @keydown.enter.prevent="addTextMessage()"
              >
              <button
                type="button"
                class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                @click="addTextMessage()"
              >
                添加文字信息
              </button>
            </div>

            <div>
              <label
                for="imgMsg"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                图片信息
              </label>
              <input
                id="imgMsg"
                type="file"
                accept="image/*"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
                @change="handleMessageImageInput"
              >
              <img
                v-if="messageImg"
                :src="messageImg"
                alt="Message image preview"
                class="mt-3 max-h-32 rounded-lg border border-slate-200 object-cover"
              >
              <label class="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <input
                  v-model="isSticker"
                  type="checkbox"
                >
                贴图
              </label>
              <button
                type="button"
                class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canAddMessageImg || isUploading"
                @click="handleAddImageMessage"
              >
                添加图片信息
              </button>
            </div>

            <div>
              <label
                for="timeContent"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                时间信息
              </label>
              <input
                id="timeContent"
                v-model="timeContent"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="时间"
                @keydown.enter.prevent="addTimeMessage()"
              >
              <button
                type="button"
                class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                @click="addTimeMessage()"
              >
                添加时间信息
              </button>
            </div>

            <div>
              <label
                for="imgCenterMsg"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                中间/场景图
              </label>
              <input
                id="imgCenterMsg"
                type="file"
                accept="image/*"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
                @change="handleCenterImageInput"
              >
              <img
                v-if="centerImg"
                :src="centerImg"
                alt="Scene image preview"
                class="mt-3 max-h-32 rounded-lg border border-slate-200 object-cover"
              >
              <button
                type="button"
                class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canAddCenterImg || isUploading"
                @click="handleAddCenterImage"
              >
                添加场景图
              </button>
            </div>

            <div>
              <label
                for="timepassContent"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                过度线
              </label>
              <input
                id="timepassContent"
                v-model="timepassContent"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="过度线长度 (预设: 30)"
              >
              <button
                type="button"
                class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                @click="addTimepassMessage()"
              >
                添加过度线
              </button>
            </div>

            <div>
              <label
                for="callContent"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                打电话/视频
              </label>
              <input
                id="callContent"
                v-model="callContent"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="通话时长 00:42 / 对方已拒绝 / 已取消"
              >
              <div class="mt-2 flex flex-wrap gap-4">
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    v-model="callType"
                    type="radio"
                    value="phone"
                    name="callOpt"
                  >
                  电话
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    v-model="callType"
                    type="radio"
                    value="video"
                    name="callOpt"
                  >
                  视频
                </label>
              </div>
              <button
                type="button"
                class="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                @click="addCallMessage()"
              >
                添加通话信息
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:sticky xl:top-4 xl:self-start">
        <ChatPreview
          ref="chatPreviewRef"
          :chat-name="form.chatName"
          :chat-type="chatType"
          :chat-list="chatList"
          :default-img="defaultImg"
          :is-generating="isGenerating"
          @delete-message="deleteMessage"
          @change-side="changeMessageSide"
          @edit-content="updateMessageContent"
        />
      </div>
    </div>

    <div
      v-if="isSaving || isUploading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-white"
    >
      <div class="text-center">
        <div class="mb-2 text-lg">
          {{ isUploading ? 'Uploading ...' : 'Saving ...' }}
        </div>
      </div>
    </div>

    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Generated image preview"
    >
      <div class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">
            生成图片
          </h3>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            aria-label="Close image preview"
            @click="showImageModal = false"
          >
            Close
          </button>
        </div>
        <img
          v-if="generatedImage"
          :src="generatedImage"
          alt="Generated chat preview"
          class="w-full"
        >
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: 'auth',
})

const chatPreviewRef = ref(null)
const isGenerating = ref(false)

const {
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
} = useChatEditor()

const characterImageEvent = ref(null)
const imgMsgEvent = ref(null)
const imgCenterMsgEvent = ref(null)

const handleCharacterImageInput = async (event) => {
  characterImageEvent.value = event
  await handleCharacterImageChange(event)
}

const handleMessageImageInput = async (event) => {
  imgMsgEvent.value = event
  await handleMessageImageChange(event)
}

const handleCenterImageInput = async (event) => {
  imgCenterMsgEvent.value = event
  await handleCenterImageChange(event)
}

const handleAddCharacter = () => {
  addCharacter(undefined, undefined, characterImageEvent.value)
  characterImageEvent.value = null
}

const handleAddImageMessage = () => {
  addImageMessage(undefined, undefined, undefined, undefined, undefined, imgMsgEvent.value)
  imgMsgEvent.value = null
}

const handleAddCenterImage = () => {
  addCenterImage(undefined, imgCenterMsgEvent.value)
  imgCenterMsgEvent.value = null
}

const handleSave = async () => {
  await saveChat()
}

const handleGenerate = async () => {
  isGenerating.value = true

  await nextTick()

  try {
    await generatePreviewImage(chatPreviewRef.value?.chatPageRef)
  } finally {
    isGenerating.value = false
  }
}

onMounted(() => {
  loadChat()
})
</script>
