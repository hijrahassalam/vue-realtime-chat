<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="router.push('/rooms')" class="text-gray-500 hover:text-gray-700">←</button>
          <div>
            <h1 class="text-xl font-bold text-gray-800">{{ chat.currentRoom?.name }}</h1>
            <p class="text-sm text-gray-500">{{ chat.participants.length }} participants</p>
          </div>
        </div>
        <button @click="handleLeave" class="text-sm text-red-600 hover:underline">Leave Room</button>
      </div>
    </header>

    <!-- Messages -->
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-4 overflow-y-auto" ref="messagesContainer">
      <div v-if="loading" class="text-center py-8 text-gray-500">Loading messages...</div>

      <div v-else class="space-y-3">
        <div
          v-for="msg in chat.messages"
          :key="msg.id"
          class="flex"
          :class="msg.user_id === auth.user?.id ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm"
            :class="msg.user_id === auth.user?.id
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md shadow-sm'"
          >
            <p v-if="msg.user_id !== auth.user?.id" class="text-xs font-semibold text-blue-600 mb-1">
              {{ msg.user?.name }}
            </p>
            <p>{{ msg.body }}</p>
            <p
              class="text-xs mt-1 text-right"
              :class="msg.user_id === auth.user?.id ? 'text-blue-200' : 'text-gray-400'"
            >
              {{ formatTime(msg.created_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="typingUserNames.length > 0" class="text-sm text-gray-500 italic mt-2">
        {{ typingUserNames.join(', ') }} {{ typingUserNames.length === 1 ? 'is' : 'are' }} typing...
      </div>
    </main>

    <!-- Input -->
    <footer class="bg-white border-t">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <form @submit.prevent="sendMessage" class="flex gap-3">
          <input
            v-model="messageText"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            @input="sendTyping"
          />
          <button
            type="submit"
            :disabled="!messageText.trim()"
            class="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </form>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
let typingTimer = null

const typingUserNames = computed(() => {
  return Object.entries(chat.typingUsers)
    .filter(([uid]) => parseInt(uid) !== auth.user?.id)
    .map(([uid]) => chat.participants.find((p) => p.id === parseInt(uid))?.name || 'Someone')
})

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  if (!messageText.value.trim()) return
  const body = messageText.value.trim()
  messageText.value = ''
  try {
    await chat.sendMessage(route.params.id, body)
    scrollToBottom()
  } catch {
    messageText.value = body
  }
}

function sendTyping() {
  clearTimeout(typingTimer)
  // Typing event via Echo would be triggered here
  // For now skip since broadcast requires Echo to be fully connected
}

onMounted(async () => {
  try {
    await chat.fetchRoom(route.params.id)
    await chat.joinRoom(route.params.id)
    await chat.fetchMessages(route.params.id)
    chat.listenToRoom(route.params.id)
    scrollToBottom()
  } catch {
    router.push('/rooms')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  chat.unlistenRoom(route.params.id)
})
</script>
