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
      class="space-y-4"
    >
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          to="/listing"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← 回到目录
        </NuxtLink>

        <button
          type="button"
          class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          aria-label="Save text"
          @click="handleSave"
        >
          {{ isSaving ? '保存中...' : '保存记录' }}
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

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">
          文本设定
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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
            >
              <option value="">
                选择下个章节...
              </option>
              <option
                v-for="chapter in chapterOptions"
                :key="chapter.id"
                :value="chapter.id"
              >
                {{ chapter.title }} ({{ chapter.type === 'text' ? '文本' : '聊天' }})
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label
              for="fontSize"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              正文字号
            </label>
            <select
              id="fontSize"
              v-model.number="form.fontSize"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500 md:max-w-xs"
            >
              <option
                v-for="size in fontSizeOptions"
                :key="size"
                :value="size"
              >
                {{ size }}px
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="mb-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                v-model="form.textOnly"
                type="checkbox"
              >
              仅文字
            </label>
            <button
              type="button"
              class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isGenerating"
              aria-label="Generate image"
              @click="handleGenerate"
            >
              {{ isGenerating ? '生成中...' : '生成图片' }}
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">
          文本内容
        </h2>

        <div class="overflow-hidden rounded-lg border border-slate-300">
          <div class="flex flex-wrap items-center gap-2 border-b border-slate-300 bg-slate-50 p-3">
            <button
              v-for="tool in toolbarItems"
              :key="tool.command"
              type="button"
              class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
              :aria-label="tool.label"
              @click="handleFormat(tool.command)"
              v-html="tool.label"
            />
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <span>字号</span>
              <select
                v-model.number="toolbarFontSize"
                class="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                aria-label="Font size"
                @change="handleFontSizeChange"
              >
                <option
                  v-for="size in fontSizeOptions"
                  :key="`toolbar-${size}`"
                  :value="size"
                >
                  {{ size }}px
                </option>
              </select>
            </label>
          </div>

          <div
            ref="editorRef"
            contenteditable
            class="rich-text-editor min-h-[300px] max-h-[70vh] overflow-y-auto p-4 outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
            :style="{ fontSize: `${form.fontSize}px` }"
            aria-label="Text content editor"
            data-placeholder="请输入文本内容..."
            @input="handleEditorInput"
          />
        </div>
      </div>
    </div>

    <div
      v-if="isSaving || isGenerating"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-white"
    >
      <div class="text-lg">
        {{ isGenerating ? 'Generating...' : 'Uploading ...' }}
      </div>
    </div>

    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Generated image preview"
    >
      <div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-xl">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-slate-900">
            生成图片
          </h3>
          <div class="flex items-center gap-2">
            <button
              v-if="generatedImage"
              type="button"
              class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              aria-label="Download generated image"
              @click="handleDownloadGeneratedImage"
            >
              下载
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              aria-label="Close image preview"
              @click="showImageModal = false"
            >
              关闭
            </button>
          </div>
        </div>
        <img
          v-if="generatedImage"
          :src="generatedImage"
          alt="Generated text preview"
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

const editorRef = ref(null)
const toolbarFontSize = ref(18)

const fontSizeOptions = [14, 16, 18, 20, 22, 24, 28, 32, 36]

const toolbarItems = [
  { command: 'bold', label: '<strong>B</strong>' },
  { command: 'italic', label: '<em>I</em>' },
  { command: 'underline', label: '<u>U</u>' },
  { command: 'insertUnorderedList', label: '• 列表' },
  { command: 'insertOrderedList', label: '1. 列表' },
  { command: 'justifyLeft', label: '←' },
  { command: 'justifyCenter', label: '↔' },
  { command: 'justifyRight', label: '→' },
]

const {
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
} = useTextEditor()

const syncEditorContent = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = textContent.value || ''
  }
}

const handleEditorInput = (event) => {
  textContent.value = event.target.innerHTML
}

const handleFormat = (command) => {
  editorRef.value?.focus()
  document.execCommand(command, false, null)
}

const handleFontSizeChange = () => {
  const size = Number(toolbarFontSize.value)

  if (!size || !editorRef.value) {
    return
  }

  editorRef.value.focus()

  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return
  }

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (selectedText) {
    const span = document.createElement('span')
    span.style.fontSize = `${size}px`
    span.textContent = selectedText
    range.deleteContents()
    range.insertNode(span)
    range.setStartAfter(span)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  } else {
    document.execCommand('insertHTML', false, `<span style="font-size: ${size}px">&#8203;</span>`)
  }

  textContent.value = editorRef.value.innerHTML
}

const handleSave = async () => {
  if (editorRef.value) {
    textContent.value = editorRef.value.innerHTML
  }

  await saveText()
}

const handleGenerate = async () => {
  if (editorRef.value) {
    textContent.value = editorRef.value.innerHTML
  }

  await generatePreviewImage()
}

const handleDownloadGeneratedImage = () => {
  if (!generatedImage.value) {
    return
  }

  const title = (form.genTitle || 'text').trim().replace(/[^\w\u4e00-\u9fa5-]+/g, '_')
  const link = document.createElement('a')
  link.href = generatedImage.value
  link.download = `${title || 'text'}.png`
  link.click()
}

watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => {
      syncEditorContent()
    })
  }
})

watch(() => form.fontSize, (size) => {
  toolbarFontSize.value = size
}, { immediate: true })

onMounted(async () => {
  await loadText()
  nextTick(() => {
    syncEditorContent()
  })
})
</script>

<style scoped>
.rich-text-editor:empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
}
</style>
