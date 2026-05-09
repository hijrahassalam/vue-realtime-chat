import { defineStore } from 'pinia'
import api from '../config/api'
import { getEcho, leaveChannel, resetEcho } from '../config/echo'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    availableRooms: [],
    currentRoom: null,
    messages: [],
    participants: [],
    typingUsers: {},
    loading: false,
    loadingAvailable: false,
    error: null,
    listeners: [],
    subscribedRooms: [],
    connectionStatus: 'disconnected', // 'connecting' | 'connected' | 'disconnected'
    pendingMessages: [], // optimistic messages awaiting server confirmation
  }),

  actions: {
    async fetchRooms() {
      this.loading = true
      try {
        const { data } = await api.get('/rooms')
        this.rooms = Array.isArray(data) ? data : (data?.data ?? [])
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch rooms'
      } finally {
        this.loading = false
      }
    },

    async fetchAvailableRooms() {
      this.loadingAvailable = true
      try {
        const { data } = await api.get('/rooms/available')
        this.availableRooms = Array.isArray(data) ? data : (data?.data ?? [])
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch available rooms'
      } finally {
        this.loadingAvailable = false
      }
    },

    async createRoom(name, description = '', isPrivate = false) {
      const { data } = await api.post('/rooms', { name, description, is_private: isPrivate })
      const room = data?.data ?? data
      this.rooms.unshift(room)
      return room
    },

    async fetchRoom(id) {
      const { data } = await api.get(`/rooms/${id}`)
      const room = data?.data ?? data
      this.currentRoom = room
      this.participants = room.participants || []
      return room
    },

    async joinRoom(id) {
      await api.post(`/rooms/${id}/join`)
      const idx = this.availableRooms.findIndex((r) => r.id === id)
      if (idx !== -1) {
        const [room] = this.availableRooms.splice(idx, 1)
        this.rooms.unshift(room)
      }
    },

    async leaveRoom(id) {
      await api.post(`/rooms/${id}/leave`)
      const idx = this.rooms.findIndex((r) => r.id === id)
      if (idx !== -1) {
        const [room] = this.rooms.splice(idx, 1)
        this.availableRooms.unshift(room)
      }
      if (this.currentRoom?.id === id) {
        this.currentRoom = null
        this.messages = []
      }
    },

    async fetchMessages(roomId) {
      const { data } = await api.get(`/rooms/${roomId}/messages`)
      const messages = data?.data ?? data
      this.messages = Array.isArray(messages) ? messages : []
    },

    async sendMessage(roomId, body) {
      const authStore = useAuthStore()
      const tempId = `temp-${Date.now()}`

      // Optimistic: add message immediately
      const optimisticMessage = {
        id: tempId,
        body,
        user_id: authStore.user.id,
        user: authStore.user,
        room_id: roomId,
        created_at: new Date().toISOString(),
        status: 'sending', // optimistic
      }
      this.messages.push(optimisticMessage)
      this.pendingMessages.push(tempId)

      try {
        const { data } = await api.post(`/rooms/${roomId}/messages`, { body })
        const message = data?.data ?? data

        // Replace optimistic message with server response
        const idx = this.messages.findIndex((m) => m.id === tempId)
        if (idx !== -1) {
          this.messages[idx] = { ...message, status: 'sent' }
        }
        this.pendingMessages = this.pendingMessages.filter((id) => id !== tempId)
        return message
      } catch (err) {
        // Mark as failed
        const idx = this.messages.findIndex((m) => m.id === tempId)
        if (idx !== -1) {
          this.messages[idx] = { ...this.messages[idx], status: 'failed' }
        }
        this.pendingMessages = this.pendingMessages.filter((id) => id !== tempId)
        throw err
      }
    },

    async markRead(roomId, messageId) {
      await api.post(`/rooms/${roomId}/messages/${messageId}/read`)
    },

    async retryMessage(tempId) {
      const msg = this.messages.find((m) => m.id === tempId)
      if (!msg || msg.status !== 'failed') return
      // Remove failed message and resend
      this.messages = this.messages.filter((m) => m.id !== tempId)
      await this.sendMessage(msg.room_id, msg.body)
    },

    listenToRoom(roomId) {
      if (this.subscribedRooms.includes(roomId)) return
      this.subscribedRooms.push(roomId)

      const echo = getEcho()
      const channel = echo.private(`room.${roomId}`)

      // Track connection state
      echo.connector.pusher.connection.bind('connected', () => {
        this.connectionStatus = 'connected'
      })
      echo.connector.pusher.connection.bind('disconnected', () => {
        this.connectionStatus = 'disconnected'
      })
      echo.connector.pusher.connection.bind('connecting', () => {
        this.connectionStatus = 'connecting'
      })

      channel.listen('.message.sent', (e) => {
        if (!this.messages.find((m) => m.id === e.message.id)) {
          this.messages.push(e.message)
        }
      })

      channel.listen('.user.typing', (e) => {
        this.typingUsers[e.user_id] = Date.now()
        setTimeout(() => delete this.typingUsers[e.user_id], 3000)
      })

      channel.listen('.user.joined', (e) => {
        if (!this.participants.find((p) => p.id === e.user.id)) {
          this.participants.push(e.user)
        }
      })

      this.listeners.push({ roomId, channel })
    },

    unlistenRoom(roomId) {
      leaveChannel(`room.${roomId}`)
      this.listeners = this.listeners.filter((l) => l.roomId !== roomId)
      this.subscribedRooms = this.subscribedRooms.filter((id) => id !== roomId)
    },

    reset() {
      this.rooms = []
      this.availableRooms = []
      this.currentRoom = null
      this.messages = []
      this.participants = []
      this.typingUsers = {}
      this.listeners.forEach((l) => leaveChannel(`room.${l.roomId}`))
      this.listeners = []
      this.subscribedRooms = []
      this.pendingMessages = []
      this.connectionStatus = 'disconnected'
      resetEcho()
    },
  },
})
