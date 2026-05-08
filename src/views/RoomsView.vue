<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800">Chat Rooms</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ auth.user?.name }}</span>
          <button @click="handleLogout" class="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Create Room -->
      <div class="mb-6 flex gap-3">
        <input
          v-model="newRoomName"
          type="text"
          placeholder="New room name..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          @keyup.enter="createRoom"
        />
        <button
          @click="createRoom"
          :disabled="!newRoomName.trim() || creating"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {{ creating ? 'Creating...' : 'Create Room' }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="chat.loading" class="text-center py-8 text-gray-500">Loading rooms...</div>

      <!-- Error -->
      <p v-if="chat.error" class="text-red-500 mb-4 text-sm">{{ chat.error }}</p>

      <!-- Room List -->
      <div v-if="!chat.loading" class="grid gap-4">
        <router-link
          v-for="room in chat.rooms"
          :key="room.id"
          :to="`/rooms/${room.id}`"
          class="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-800">{{ room.name }}</h3>
              <p v-if="room.description" class="text-sm text-gray-500 mt-1">{{ room.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="room.is_private" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Private</span>
              <span class="text-sm text-gray-400">→</span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="!chat.loading && chat.rooms.length === 0" class="text-center py-12 text-gray-500">
        <p>No rooms yet. Create one to get started!</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const auth = useAuthStore()
const chat = useChatStore()

const newRoomName = ref('')
const creating = ref(false)

onMounted(() => chat.fetchRooms())

async function createRoom() {
  if (!newRoomName.value.trim()) return
  creating.value = true
  try {
    await chat.createRoom(newRoomName.value.trim())
    newRoomName.value = ''
  } catch {
    // error shown via store
  } finally {
    creating.value = false
  }
}

async function handleLogout() {
  await auth.logout()
  chat.reset()
  router.push('/login')
}
</script>
