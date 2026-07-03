<template>
  <section>
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">
          列表
        </h1>
        <p class="mt-2 text-slate-600">
          {{ listingDescription }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isCreatingChat"
          aria-label="Create new chat"
          @click="handleCreateChat"
        >
          {{ isCreatingChat ? '创建中...' : '添加新对话' }}
        </button>
        <button
          type="button"
          class="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isCreatingText"
          aria-label="Create new text"
          @click="handleCreateText"
        >
          {{ isCreatingText ? '创建中...' : '添加新文本' }}
        </button>
      </div>
    </div>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-xs">
        <label
          for="searchTitle"
          class="sr-only"
        >
          搜索标题
        </label>
        <input
          id="searchTitle"
          v-model="searchQuery"
          type="search"
          placeholder="搜索标题..."
          class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          aria-label="搜索标题"
          @input="handleSearchInput"
        >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <label
          for="sortBy"
          class="text-sm font-medium text-slate-700"
        >
          排序
        </label>
        <select
          id="sortBy"
          v-model="sortBy"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          aria-label="Sort field"
          @change="loadRecords"
        >
          <option value="genTitle">
            标题
          </option>
          <option value="createdAt">
            创建日期
          </option>
        </select>

        <select
          id="sortOrder"
          v-model="sortOrder"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          aria-label="Sort order"
          @change="loadRecords"
        >
          <option value="asc">
            升序
          </option>
          <option value="desc">
            降序
          </option>
        </select>
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="isLoading"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600"
    >
      加载中...
    </div>

    <div
      v-else-if="records.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-slate-600">
        {{ searchQuery.trim() ? '没有找到匹配的记录。' : '还没有记录，点击上方按钮创建第一个。' }}
      </p>
    </div>

    <div
      v-else
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="record in records"
        :key="record.id"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="mb-2 flex items-center gap-2">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="record.type === 'text' ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'"
          >
            {{ record.type === 'text' ? '文本' : '聊天' }}
          </span>
          <h2 class="text-lg font-semibold text-slate-900">
            {{ record.genTitle || '无标题' }}
          </h2>
        </div>

        <p class="text-sm text-slate-600">
          {{ record.author || '无名' }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          创建: {{ formatDate(record.createdAt) }}
        </p>
        <p
          v-if="isMasterAccount && record.createdBy?.name"
          class="mt-1 text-xs text-slate-500"
        >
          创建者: {{ record.createdBy.name }}
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <NuxtLink
            :to="getEditPath(record)"
            class="rounded-lg px-3 py-2 text-sm font-medium text-white transition"
            :class="record.type === 'text' ? 'bg-sky-600 hover:bg-sky-500' : 'bg-indigo-600 hover:bg-indigo-500'"
          >
            编辑
          </NuxtLink>

          <NuxtLink
            :to="getViewPath(record)"
            target="_blank"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            查看
          </NuxtLink>

          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            aria-label="Duplicate record"
            @click="handleDuplicate(record)"
          >
            复制
          </button>

          <button
            type="button"
            class="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            aria-label="Delete record"
            @click="handleDelete(record)"
          >
            删除
          </button>
        </div>

        <p
          v-if="record.type !== 'text'"
          class="mt-3 text-xs text-red-600"
        >
          复制按钮会复制标题、作者和人物列表，对话内容会清空。
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: 'auth',
})

const { user } = useAuth()
const isMasterAccount = computed(() => Boolean(user.value?.isMaster))
const listingDescription = computed(() => {
  if (isMasterAccount.value) {
    return '所有用户的聊天与文本记录'
  }

  return '你创建的所有聊天与文本记录'
})

const records = ref([])
const isLoading = ref(true)
const isCreatingChat = ref(false)
const isCreatingText = ref(false)
const errorMessage = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const searchQuery = ref('')
let searchTimer = null

const loadRecords = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/records', {
      query: {
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        search: searchQuery.value.trim() || undefined,
      },
    })

    records.value = response.records
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Failed to load records.'
  } finally {
    isLoading.value = false
  }
}

const handleSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadRecords()
  }, 300)
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString()
}

const getEditPath = (record) => {
  if (record.type === 'text') {
    return `/text/${record.id}`
  }

  return `/chat/${record.id}`
}

const getViewPath = (record) => {
  if (record.type === 'text') {
    return `/view/text/${record.id}`
  }

  return `/view/chat/${record.id}`
}

const handleCreateChat = async () => {
  isCreatingChat.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/chats', {
      method: 'POST',
      body: {},
    })

    await navigateTo(`/chat/${response.chat.id}`)
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Failed to create chat.'
  } finally {
    isCreatingChat.value = false
  }
}

const handleCreateText = async () => {
  isCreatingText.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/texts', {
      method: 'POST',
      body: {},
    })

    await navigateTo(`/text/${response.text.id}`)
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Failed to create text.'
  } finally {
    isCreatingText.value = false
  }
}

const handleDelete = async (record) => {
  if (!confirm('此操作不可逆转，确认删除？')) {
    return
  }

  const endpoint = record.type === 'text'
    ? `/api/texts/${record.id}`
    : `/api/chats/${record.id}`

  try {
    await $fetch(endpoint, {
      method: 'DELETE',
    })

    records.value = records.value.filter((item) => item.id !== record.id)
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Failed to delete record.'
  }
}

const handleDuplicate = async (record) => {
  if (record.type === 'text') {
    try {
      const response = await $fetch(`/api/texts/${record.id}/duplicate`, {
        method: 'POST',
      })

      await loadRecords()
      await navigateTo(`/text/${response.text.id}`)
    } catch (error) {
      errorMessage.value = error?.data?.statusMessage || 'Failed to duplicate text.'
    }

    return
  }

  try {
    const response = await $fetch(`/api/chats/${record.id}/duplicate`, {
      method: 'POST',
    })

    await loadRecords()
    await navigateTo(`/chat/${response.chat.id}`)
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Failed to duplicate chat.'
  }
}

onMounted(() => {
  loadRecords()
})

onUnmounted(() => {
  clearTimeout(searchTimer)
})
</script>
