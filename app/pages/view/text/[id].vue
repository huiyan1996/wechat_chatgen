<template>
  <div class="text-view-page min-h-screen w-full py-10">
    <div class="text-view-container mx-auto w-full px-4">
      <div
        v-if="isLoading"
        class="rounded-2xl border border-slate-200 bg-white p-10 text-center"
      >
        <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
        <p class="text-slate-600">
          正在加载文本内容...
        </p>
      </div>

      <div
        v-else-if="loadError"
        class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
      >
        {{ loadError }}
      </div>

      <article
        v-else
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 class="mb-3 text-center text-3xl font-semibold text-slate-900">
          {{ genTitle }}
        </h1>

        <div class="mb-6 text-center text-slate-600">
          <span class="mr-2 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
            文本
          </span>
          作者: {{ author }}
        </div>

        <hr class="my-6 border-slate-200">

        <div
          v-if="textContent"
          class="text-view-content text-lg leading-relaxed text-slate-800"
          v-html="textContent"
        />

        <p
          v-else
          class="text-center text-slate-500"
        >
          暂无内容
        </p>

        <div
          v-if="nextChapter?.id"
          class="mt-8 text-center"
        >
          <NuxtLink
            :to="nextChapterPath"
            class="text-lg font-medium text-emerald-600 hover:text-emerald-500"
          >
            下一章
          </NuxtLink>
        </div>
      </article>
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
  genTitle,
  author,
  textContent,
  nextChapter,
  nextChapterPath,
  loadText,
} = useTextViewer()

onMounted(() => {
  loadText()
})
</script>
