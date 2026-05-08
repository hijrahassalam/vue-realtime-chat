import { defineStore } from 'pinia'
import api from '../config/api'
import { getEcho, leaveChannel } from '../config/echo'

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    currentRoom: null,
    messages: [],
    participants: [],
    typingUsers: {},
    loading: false,
    error: null,
    listeners: [],
  }),

  actions: {
    async fetchRooms() {
      this.loading = true
      try {
        const { data } = await api.get('/rooms')
        this.rooms = data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch rooms'
      } finally {
        this.loading = false
      }
    },

    async createRoom(name, description = '', isPrivate = false) {
      const { data } = await api.post('/rooms', { name, description, is_private: isPrivate })
      this.rooms.unshift(data)
      return data
    },

    async fetchRoom(id) {
      const { data } = await api.get(`/rooms/${id}`)
      this.currentRoom = data
      this.participants = data.participants || []
      return data
    },

    async joinRoom(id) {
      await api.post(`/rooms/${id}/join`)
    },

    async leaveRoom(id) {
      await api.post(`/rooms/${id}/leave`)
      this.rooms = this.rooms.filter((r) => r.id !== id)
      if (this.currentRoom?.id === id) {
        this.currentRoom = null
        this.messages = []
      }
    },

    async fetchMessages(roomId) {
      const { data } = await api.get(`/rooms/${roomId}/messages`)
      this.messages = data.data || data
    },

    async sendMessage(roomId, body) {
      const { data } = await api.post(`/rooms/${roomId}/messages`, { body })
      this.messages.push(data)
      return data
    },

    async markRead(roomId, messageId) {
      await api.post(`/rooms/${roomId}/messages/${messageId}/read`)
    },

    listenToRoom(roomId) {
      const echo = getEcho()
      const channel = echo.private(`room.${roomId}`)

      channel.listen('MessageSent', (e) => {
        if (!this.messages.find((m) => m.id === e.message.id)) {
          this.messages.push(e.message)
        }
      })

      channel.listen('UserTyping', (e) => {
        this.typingUsers[e.user_id] = Date.now()
        setTimeout(() => delete this.typingUsers[e.user_id], 3000)
      })

      channel.listen('UserJoined', (e) => {
        if (!this.participants.find((p) => p.id === e.user.id)) {
          this.participants.push(e.user)
        }
      })

      this.listeners.push({ roomId, channel })
    },

    unlistenRoom(roomId) {
      leaveChannel(`room.${roomId}`)
      this.listeners = this.listeners.filter((l) => l.roomId !== roomId)
    },

    reset() {
      this.rooms = []
      this.currentRoom = null
      this.messages = []
      this.participants = []
      this.typingUsers = {}
      this.listeners.forEach((l) => leaveChannel(`room.${l.roomId}`))
      this.listeners = []
    },
  },
})
