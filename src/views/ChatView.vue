<template>
  <div class="h-screen flex flex-col bg-surface-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200">
      <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="router.push('/rooms')" class="btn-ghost p-2 -ml-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span class="text-lg font-bold text-primary-600">{{ chat.currentRoom?.name?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <div>
              <h1 class="font-semibold text-gray-900">{{ chat.currentRoom?.name }}</h1>
              <div class="flex items-center gap-2">
                <p class="text-xs text-gray-500">{{ chat.participants.length }} members</p>
                <span class="flex items-center gap-1">
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-green-400': chat.connectionStatus === 'connected',
                      'bg-yellow-400 animate-pulse': chat.connectionStatus === 'connecting',
                      'bg-red-400': chat.connectionStatus === 'disconnected',
                    }"
                  />
                  <span class="text-[10px] text-gray-400 capitalize">{{ chat.connectionStatus }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <button @click="handleLeave" class="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 text-sm">
          <svg class="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Leave
        </button>
      </div>
    </header>

    <!-- Messages -->
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto scrollbar-thin" ref="messagesContainer">
      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex" :class="i % 2 === 0 ? 'justify-end' : 'justify-start'">
          <div class="animate-pulse" :class="i % 2 === 0 ? 'w-48' : 'w-40'">
            <div class="h-4 rounded-full" :class="i % 2 === 0 ? 'bg-primary-100' : 'bg-surface-200'" />
            <div class="h-3 mt-1 rounded-full w-3/4" :class="i % 2 === 0 ? 'bg-primary-50' : 'bg-surface-100'" />
          </div>
        </div>
      </div>

      <!-- Messages list -->
      <div v-else class="space-y-1">
        <!-- Date separator -->
        <div v-if="chat.messages.length > 0" class="flex items-center gap-4 my-4">
          <div class="flex-1 h-px bg-surface-200" />
          <span class="text-xs font-medium text-gray-400 px-2">Today</span>
          <div class="flex-1 h-px bg-surface-200" />
        </div>

        <div
          v-for="(msg, index) in chat.messages"
          :key="msg.id"
          class="flex animate-fade-in"
          :class="msg.user_id === auth.user?.id ? 'justify-end' : 'justify-start'"
        >
          <!-- Other user avatar -->
          <div v-if="msg.user_id !== auth.user?.id && showAvatar(index)" class="mr-2 mt-1">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span class="text-xs font-bold text-gray-600">{{ msg.user?.name?.charAt(0)?.toUpperCase() }}</span>
            </div>
          </div>
          <div v-else-if="msg.user_id !== auth.user?.id" class="w-8 mr-2" />

          <div class="max-w-[75%]" :class="msg.user_id === auth.user?.id ? 'items-end' : 'items-start'">
            <!-- Name label -->
            <p v-if="msg.user_id !== auth.user?.id && showAvatar(index)" class="text-xs font-semibold text-primary-600 mb-1 ml-1">
              {{ msg.user?.name }}
            </p>

            <!-- Bubble -->
            <div
              class="px-4 py-2.5 text-sm"
              :class="[
                msg.user_id === auth.user?.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-md shadow-btn'
                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-card border border-surface-200',
                isConsecutive(index) ? (msg.user_id === auth.user?.id ? 'rounded-tr-md' : 'rounded-tl-md') : ''
              ]"
            >
              <p class="leading-relaxed">{{ msg.body }}</p>
            </div>

            <!-- Time + Status -->
            <div class="flex items-center gap-1 mt-0.5 px-1">
              <p
                class="text-[10px]"
                :class="msg.user_id === auth.user?.id ? 'text-gray-400' : 'text-gray-400'"
              >
                {{ formatTime(msg.created_at) }}
              </p>
              <!-- Message status for sender -->
              <span v-if="msg.user_id === auth.user?.id" class="flex items-center">
                <svg v-if="msg.status === 'sending'" class="w-3 h-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else-if="msg.status === 'sent'" class="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <button v-else-if="msg.status === 'failed'" @click="chat.retryMessage(msg.id)" class="text-[10px] text-red-500 hover:text-red-600 underline">
                  Retry
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!loading && chat.messages.length === 0" class="text-center py-20">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">No messages yet</h3>
          <p class="text-sm text-gray-500">Be the first to say hello!</p>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="typingUserNames.length > 0" class="flex items-center gap-2 mt-3 animate-slide-up">
        <div class="flex -space-x-1">
          <div v-for="name in typingUserNames.slice(0, 3)" :key="name"
               class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border-2 border-surface-50">
            <span class="text-[8px] font-bold text-gray-600">{{ name.charAt(0) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full shadow-card border border-surface-200">
          <div class="flex gap-0.5">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
          </div>
          <span class="text-xs text-gray-500 ml-1">
            {{ typingUserNames.join(', ') }} {{ typingUserNames.length === 1 ? 'is' : 'are' }} typing
          </span>
        </div>
      </div>
    </main>

    <!-- Input -->
    <footer class="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-surface-200">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <form @submit.prevent="sendMessage" class="flex items-end gap-3">
          <div class="flex-1 relative">
            <textarea
              v-model="messageText"
              placeholder="Type a message..."
              rows="1"
              class="input-field resize-none pr-12 min-h-[44px] max-h-[120px]"
              @keydown.enter.exact.prevent="sendMessage"
              @input="autoResize"
              ref="inputRef"
            />
          </div>
          <button
            type="submit"
            :disabled="!messageText.trim()"
            class="w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200"
            :class="messageText.trim()
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-btn hover:shadow-lg active:scale-[0.95]'
              : 'bg-surface-100 text-gray-400 cursor-not-allowed'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const chat = useChatStore()

const messageText = ref('')
const loading = ref(true)
const messagesContainer = ref(null)
const inputRef = ref(null)

const typingUserNames = computed(() => {
  return Object.entries(chat.typingUsers)
    .filter(([uid]) => parseInt(uid) !== auth.user?.id)
    .map(([uid]) => chat.participants.find((p) => p.id === parseInt(uid))?.name || 'Someone')
})

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function showAvatar(index) {
  if (index === 0) return true
  const prev = chat.messages[index - 1]
  const curr = chat.messages[index]
  return prev.user_id !== curr.user_id
}

function isConsecutive(index) {
  if (index === 0) return false
  const prev = chat.messages[index - 1]
  const curr = chat.messages[index]
  return prev.user_id === curr.user_id
}

function scrollToBottom(smooth = true) {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  })
}

function autoResize() {
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}

async function sendMessage() {
  if (!messageText.value.trim()) return
  const body = messageText.value.trim()
  messageText.value = ''
  nextTick(() => autoResize())
  try {
    await chat.sendMessage(route.params.id, body)
    scrollToBottom(false) // initial load: no animation
  } catch {
    messageText.value = body
  }
}

async function handleLeave() {
  try {
    await chat.leaveRoom(route.params.id)
  } finally {
    router.push('/rooms')
  }
}

onMounted(async () => {
  try {
    await chat.fetchRoom(route.params.id)
    await chat.joinRoom(route.params.id)
    await chat.fetchMessages(route.params.id)
    chat.listenToRoom(route.params.id)
    scrollToBottom(false) // initial load: no animation
  } catch {
    router.push('/rooms')
  } finally {
    loading.value = false
  }
  nextTick(() => inputRef.value?.focus())
})

onUnmounted(() => {
  chat.unlistenRoom(route.params.id)
})

watch(() => chat.messages.length, () => {
  scrollToBottom()
})
</script>
