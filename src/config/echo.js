import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo = null

export function getEcho() {
  if (echo) return echo

  window.Pusher = Pusher

  echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY || 'app-key',
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
  })

  return echo
}

export function leaveChannel(channel) {
  if (echo && echo.connector.channels.channels[channel]) {
    echo.leave(channel)
  }
}
