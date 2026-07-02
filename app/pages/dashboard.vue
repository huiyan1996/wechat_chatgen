<template>
  <section>
    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p class="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Dashboard
      </p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">
        Welcome, {{ user?.name || 'there' }}
      </h1>
      <p class="mt-3 max-w-2xl text-slate-600">
        You are signed in to ChatGen. This is your default home page after login.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <NuxtLink
          to="/listing"
          class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          View all records
        </NuxtLink>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 class="text-sm font-semibold text-slate-900">
            Account email
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            {{ user?.email }}
          </p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 class="text-sm font-semibold text-slate-900">
            Status
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Authenticated and ready to build chat features.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: 'auth',
})

const { user } = useAuth()
</script>
