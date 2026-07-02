<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <NuxtLink
        to="/dashboard"
        class="text-lg font-semibold tracking-tight text-slate-900"
        aria-label="Go to dashboard"
      >
        {{ appName }}
      </NuxtLink>

      <nav class="flex items-center gap-4">
        <NuxtLink
          to="/dashboard"
          class="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/listing"
          class="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Listing
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <p
          v-if="user"
          class="hidden text-sm text-slate-600 sm:block"
        >
          {{ user.name }}
        </p>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Log out"
          @click="handleLogout"
        >
          Log out
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const config = useRuntimeConfig()
const appName = config.public.appName
const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>
