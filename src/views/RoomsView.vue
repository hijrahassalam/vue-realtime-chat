<template>
  <div class="min-h-screen bg-surface-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200">
      <div class="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 class="text-lg font-bold text-gray-900">ChatFlow</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-50 rounded-full">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
              <span class="text-xs font-bold text-white">{{ auth.user?.name?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <span class="text-sm font-medium text-gray-700">{{ auth.user?.name }}</span>
          </div>
          <button @click="handleLogout" class="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6">
      <!-- Create Room -->
      <div class="mb-6">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <input
              v-model="newRoomName"
              type="text"
              placeholder="Create a new room..."
              class="input-field pl-11"
              @keyup.enter="createRoom"
            />
          </div>
          <button
            @click="createRoom"
            :disabled="!newRoomName.trim() || creating"
            class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl
                   hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-btn hover:shadow-lg active:scale-[0.98]"
          >
            <span v-if="creating">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            <span v-else>Create</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 bg-surface-100 rounded-xl mb-6">
        <button
          @click="activeTab = 'my'"
          class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="activeTab === 'my' ? 'bg-white text-gray-900 shadow-card' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            My Rooms
            <span v-if="chat.rooms.length" class="ml-1 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
              {{ chat.rooms.length }}
            </span>
          </span>
        </button>
        <button
          @click="activeTab = 'available'"
          class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="activeTab === 'available' ? 'bg-white text-gray-900 shadow-card' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Discover
            <span v-if="chat.availableRooms.length" class="ml-1 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
              {{ chat.availableRooms.length }}
            </span>
          </span>
        </button>
      </div>

      <!-- Error -->
      <div v-if="chat.error" class="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl animate-scale-in">
        <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-600">{{ chat.error }}</p>
      </div>

      <!-- My Rooms Tab -->
      <div v-if="activeTab === 'my'">
        <div v-if="chat.loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-4 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-surface-200 rounded-xl" />
              <div class="flex-1">
                <div class="h-4 bg-surface-200 rounded w-1/3 mb-2" />
                <div class="h-3 bg-surface-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3 animate-stagger">
          <router-link
            v-for="room in chat.rooms"
            :key="room.id"
            :to="`/rooms/${room.id}`"
            class="block bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover border border-surface-200
                   transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shrink-0
                          group-hover:from-primary-200 group-hover:to-primary-300 transition-colors duration-200">
                <span class="text-lg font-bold text-primary-600">{{ room.name?.charAt(0)?.toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 truncate">{{ room.name }}</h3>
                <p v-if="room.description" class="text-sm text-gray-500 truncate mt-0.5">{{ room.description }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-gray-400">{{ room.participants?.length || 0 }} members</span>
                  <span v-if="room.latestMessage?.[0]" class="text-xs text-gray-400">·</span>
                  <span v-if="room.latestMessage?.[0]" class="text-xs text-gray-400 truncate">{{ room.latestMessage[0].body }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="room.is_private" class="badge bg-surface-100 text-gray-600">
                  <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
                <svg class="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </router-link>
        </div>

        <div v-if="!chat.loading && chat.rooms.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">No rooms yet</h3>
          <p class="text-sm text-gray-500">Create your first room to get started!</p>
        </div>
      </div>

      <!-- Available Rooms Tab -->
      <div v-if="activeTab === 'available'">
        <div v-if="chat.loadingAvailable" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-4 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-surface-200 rounded-xl" />
              <div class="flex-1">
                <div class="h-4 bg-surface-200 rounded w-1/3 mb-2" />
                <div class="h-3 bg-surface-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3 animate-stagger">
          <div
            v-for="room in chat.availableRooms"
            :key="room.id"
            class="bg-white rounded-xl p-4 shadow-card border border-surface-200 transition-all duration-200 hover:shadow-card-hover"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shrink-0">
                <span class="text-lg font-bold text-emerald-600">{{ room.name?.charAt(0)?.toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 truncate">{{ room.name }}</h3>
                <p v-if="room.description" class="text-sm text-gray-500 truncate mt-0.5">{{ room.description }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-gray-400">{{ room.participants?.length || 0 }} members</span>
                  <span v-if="room.owner" class="text-xs text-gray-400">·</span>
                  <span v-if="room.owner" class="text-xs text-gray-400">by {{ room.owner.name }}</span>
                </div>
              </div>
              <button
                @click="joinRoom(room.id)"
                :disabled="joiningId === room.id"
                class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl
                       hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <span v-if="joiningId === room.id" class="flex items-center gap-1">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining
                </span>
                <span v-else class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Join
                </span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="!chat.loadingAvailable && chat.availableRooms.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">No rooms available</h3>
          <p class="text-sm text-gray-500">All rooms have been joined or create a new one!</p>
        </div>
      </div>
    </main>

    <!-- Footer credit -->
    <footer class="py-4 text-center">
      <div class="flex items-center justify-center gap-3 text-xs text-gray-400">
        <span>
          Built by
          <a href="https://hijrahassalam.com" target="_blank" rel="noopener" class="text-primary-500 hover:text-primary-600 transition-colors">
            hijrahassalam.com
          </a>
        </span>
        <span class="text-gray-300">·</span>
        <a href="https://github.com/hijrahassalam/vue-realtime-chat" target="_blank" rel="noopener"
           class="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const auth = useAuthStore()
const chat = useChatStore()

const newRoomName = ref('')
const creating = ref(false)
const activeTab = ref('my')
const joiningId = ref(null)

onMounted(() => {
  chat.fetchRooms()
  chat.fetchAvailableRooms()
})

watch(activeTab, (tab) => {
  if (tab === 'my') chat.fetchRooms()
  else chat.fetchAvailableRooms()
})

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

async function joinRoom(id) {
  joiningId.value = id
  try {
    await chat.joinRoom(id)
    router.push(`/rooms/${id}`)
  } catch {
    // error shown via store
  } finally {
    joiningId.value = null
  }
}

async function handleLogout() {
  await auth.logout()
  chat.reset()
  router.push('/login')
}
</script>
