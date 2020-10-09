<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          LT Timer
        </v-card-title>
        <v-card-text>
          <span class="text-subtitle-1 pl-6">
            {{ timeFormatWithSec(now_time) }}
          </span>
          <v-timeline
            align-top
            dense
          >
            <v-timeline-item
              v-for="(timer, key) in timers"
              :key="key"
              :color="getColor(timer)"
              small
            >
              <div>
                <div class="font-weight-normal">
                  {{ timeFormat(timer.starts_at) }}-{{ timeFormat(timer.ends_at) }}
                  <strong>{{ timer.title }}</strong><br>
                  <v-progress-linear v-if="isPast(timer.ends_at)" value="0" />
                  <v-progress-linear v-else-if="isFuture(timer.starts_at)" value="100" />
                  <v-progress-linear v-else :value="getPercent(timer.starts_at, timer.ends_at)" />
                  <span v-if="isCurrent(timer.starts_at, timer.ends_at)">
                    残り{{ getRemainSeconds(timer.ends_at) }}秒
                  </span>
                  <span v-if="isNearFuture(timer.starts_at, timer.ends_at)">
                    開始まであと{{ getRemainSeconds(timer.starts_at) }}秒
                  </span>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/messaging'

export default {
  async asyncData ({ $axios }) {
    const response = await $axios.get('https://lt-timer-go.herokuapp.com/api/timers')
    const clientTime = new Date()
    const serverTime = new Date(response.headers.date)
    const diff = serverTime.getTime() - clientTime.getTime() + 1 // 時刻の微妙なズレ1秒加算

    return {
      timers: response.data,
      now_time: new Date(),
      diff
    }
  },
  beforeMount () {
    const messaging = firebase.messaging()
    messaging.usePublicVapidKey('BDg0GzH0pqQQ_UG0aiLUqTff4t88Ke3rZlGfsj3BhnvZxmm-c-MeGKZYSB9LJgh66z5CeVW5Z_igjsfYD9o0FSE')
    messaging.requestPermission()
      .then(() => {
        return messaging.getToken()
      })
      .then((token) => {
        this.postToken(token)
      })
      .catch(() => {
        alert('通知を利用できません。URLバーの鍵アイコンから通知を許可に設定してください。')
      })
    // トークン更新のモニタリング
    messaging.onTokenRefresh(() => {
      messaging.getToken().then((refreshedToken) => {
        this.postToken(refreshedToken)
      })
    })
  },
  mounted () {
    setInterval(() => {
      const now = new Date()
      const newTime = new Date(now.getTime() + this.diff)
      this.now_time = newTime
    }, 1000)
  },
  methods: {
    timeFormat (time) {
      const date = new Date(time)
      return date.getHours() + ':' + ('00' + date.getMinutes()).slice(-2)
    },
    timeFormatWithSec (time) {
      const date = new Date(time)
      return date.getHours() + ':' + ('00' + date.getMinutes()).slice(-2) + ':' + ('00' + date.getSeconds()).slice(-2)
    },
    getColor (timer) {
      const current = new Date(this.now_time)
      const begin = new Date(timer.starts_at)
      const begin10m = new Date(timer.starts_at)
      begin10m.setMinutes(begin10m.getMinutes() - 10)
      const end = new Date(timer.ends_at)
      if (begin <= current && end >= current) {
        return 'red'
      } else if (begin >= current && begin10m <= current) {
        return 'pink lighten-4'
      }

      return 'white'
    },
    isPast (time) {
      return new Date(time) <= new Date(this.now_time)
    },
    isFuture (time) {
      return new Date(time) >= new Date(this.now_time)
    },
    isCurrent (start, end) {
      return !this.isPast(end) && !this.isFuture(start)
    },
    isNearFuture (startTime, end) {
      const start = new Date(startTime)
      const now = new Date(this.now_time)
      const diff = (start.getTime() - now.getTime()) / 1000

      return (diff >= 0 && diff <= 60)
    },
    getRemainSeconds (time) {
      const end = new Date(time)
      const now = new Date(this.now_time)
      return Math.ceil((end.getTime() - now.getTime()) / 1000)
    },
    getPercent (start, end) {
      const endTime = new Date(end)
      const startTime = new Date(start)
      const current = new Date(this.now_time)
      const duration = endTime.getTime() - startTime.getTime()
      const remain = endTime.getTime() - current.getTime()

      return remain / duration * 100
    },
    async postToken (token) {
      const response = await this.$axios.$post('https://lt-timer-go.herokuapp.com/api/tokens', { token })
      return response
    }
  }
}
</script>
