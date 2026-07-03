<template>
  <section class="chat-page chat-view-page w-full">
    <header>
      <div class="nav-back">
        <i class="icon icon-back" />
        <span>微信</span>
      </div>
      <h1>
        {{ chatName || '小说名字' }}
      </h1>
      <div class="nav-person">
        <i class="icon icon-person" />
      </div>
    </header>

    <main ref="messageListRef">
      <div class="message-list">
        <template
          v-for="(message, index) in revealedMessages"
          :key="index"
        >
          <div
            v-if="message.type === 'text' || message.type === 'img' || message.type === 'call'"
            class="message-item msg-item"
            :class="`message-item--${message.side}`"
          >
            <img
              v-if="message.type !== 'img' || !message.isSticker"
              class="avatar"
              :class="message.side"
              :src="message.user_img || defaultImg"
              alt="Avatar"
              @error="handleImageError"
            >

            <div
              v-else
              class="avatar"
              :class="message.side"
              :style="{ backgroundImage: `url(${message.user_img || defaultImg})` }"
            />

            <div>
              <div
                v-if="message.side === 'left' && chatType !== 'private'"
                class="text-start leftName"
              >
                {{ message.name }}
              </div>

              <div
                v-if="message.type === 'text'"
                class="message-bubble"
              >
                {{ message.content }}
              </div>

              <div
                v-else-if="message.type === 'img'"
                class="message-bubble"
                :class="message.isSticker ? 'sticker' : 'img'"
              >
                <img
                  :src="message.content"
                  alt="Message image"
                >
              </div>

              <div
                v-else-if="message.type === 'call'"
                class="message-bubble"
              >
                <div class="call-row">
                  <div>{{ message.content }}</div>
                  <div class="call-row-icon">
                    <svg
                      v-if="message.callType === 'phone'"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="phoneIcon"
                    >
                      <path
                        d="M2.10863 14.1079L3.76461 15.7639C4.02858 16.0413 4.38552 16.2119 4.76752 16.2431C5.84479 16.3311 7.91395 15.0073 8.44327 14.1917C8.8559 13.5559 8.69631 12.6629 8.69702 11.9465C10.8675 11.3476 13.1582 11.3453 15.3275 11.9399C15.3268 12.6563 15.1654 13.5497 15.5768 14.1847C16.1037 14.9979 18.1615 16.3114 19.2367 16.2294C19.6149 16.2006 19.97 16.0352 20.2357 15.7642L21.895 14.1049C22.5266 13.4721 22.4856 12.3791 21.7923 11.8009C16.3175 6.31749 7.7222 6.27776 2.21038 11.7982C1.51362 12.3797 1.47304 13.4775 2.10863 14.1079Z"
                        stroke="#000000"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="cameraIcon"
                    >
                      <path
                        stroke-linecap="round"
                        d="M 8.25 13.5 l -4.72 4.72 a 0.75 0.75 180 0 1 -1.28 -0.53 v -11.38 a 0.75 0.75 180 0 1 1.28 -0.53 l 4.72 4.72 M 19.5 5.25 h -9 a 2.25 2.25 180 0 0 -2.25 2.25 v 9 a 2.25 2.25 180 0 0 2.25 2.25 h 9 A 2.25 2.25 180 0 0 21.75 16.5 v -9 a 2.25 2.25 180 0 0 -2.25 -2.25 z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="message.type === 'time' || message.type === 'timepass'"
            class="message-list msg-item"
          >
            <div class="badge-block">
              <span
                class="time-badge"
                :class="{ time: message.type === 'timepass' }"
                :style="message.type === 'timepass' ? { height: `${message.content || 30}px` } : undefined"
              >
                {{ message.type === 'time' ? message.content : '' }}
              </span>
            </div>
          </div>

          <div
            v-else-if="message.type === 'imgCenter'"
            class="message-list msg-item"
          >
            <div class="imgCenter-badge">
              <img
                :src="message.content"
                alt="Scene image"
                class="cursor-pointer"
                @click="emit('view-image', message.content)"
              >
            </div>
          </div>
        </template>
      </div>
    </main>

    <footer>
      <i class="icon icon-voice" />
      <NuxtLink
        v-if="showNextChapter"
        :to="nextChapterPath"
        class="next-chapter-link"
      >
        下一章
      </NuxtLink>
      <button
        v-else
        type="button"
        class="text-input text-center"
        aria-label="Reveal next message"
        @click="emit('click-chat')"
      >
        点我
      </button>
      <i class="icon icon-face" />
      <i class="icon icon-plus" />
    </footer>
  </section>
</template>

<script setup>
defineProps({
  chatName: {
    type: String,
    default: '',
  },
  chatType: {
    type: String,
    default: 'group',
  },
  revealedMessages: {
    type: Array,
    default: () => [],
  },
  defaultImg: {
    type: String,
    default: '/img/icon/person.svg',
  },
  showNextChapter: {
    type: Boolean,
    default: false,
  },
  nextChapterPath: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click-chat', 'view-image'])

const messageListRef = ref(null)

const handleImageError = (event) => {
  event.target.src = '/img/icon/person.svg'
}

const scrollToBottom = () => {
  if (!messageListRef.value) {
    return
  }

  const container = messageListRef.value

  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  })
}

defineExpose({
  scrollToBottom,
})
</script>

<style src="~/assets/css/wechat-chat.css"></style>
<style src="~/assets/css/view-chat.css"></style>
