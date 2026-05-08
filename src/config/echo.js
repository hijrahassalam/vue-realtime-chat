import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo = null

export function getEcho() {
  if (echo) return echo

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'meridian-chat-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'laravel-realtime-chat-api.railway.app',
    wsPort: import.meta.env.VITE_REVERB_PORT || 443,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: true,
    disableStats: true,
    authEndpoint: `${import.meta.env.VITE_API_URL || 'https://laravel-realtime-chat-api.railway.app/api'}/broadcasting/auth`,
  })

  return echo
}

export function leaveChannel(channel) {
  if (echo && echo.connector.channels.channels[channel]) {
    echo.leave(channel)
  }
}
