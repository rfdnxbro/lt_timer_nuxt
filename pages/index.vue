<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-overlay :value="!!message">
        <v-alert
          dense
          type="info"
        >
          {{ message }}
        </v-alert>
      </v-overlay>
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
                  <span v-if="isNearFuture(timer.starts_at, timer.ends_at)">
                    開始まであと{{ getRemainSeconds(timer.starts_at) }}秒<br>
                  </span>
                  <span v-if="!isToday(timer.starts_at)">
                    {{ dateFormat(timer.starts_at) }}
                  </span>
                  {{ timeFormat(timer.starts_at) }}-{{ timeFormat(timer.ends_at) }}
                  <strong>{{ timer.title }}</strong><br>
                  <v-progress-linear v-if="isPast(timer.ends_at)" value="0" />
                  <v-progress-linear v-else-if="isFuture(timer.starts_at)" value="100" />
                  <v-progress-linear v-else :value="getPercent(timer.starts_at, timer.ends_at)" />
                  <span v-if="isCurrent(timer.starts_at, timer.ends_at)">
                    残り{{ getRemainSeconds(timer.ends_at) }}秒
                  </span>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
      <br>
      <v-card>
        <v-card-title class="headline">
          How to Use
        </v-card-title>
        <v-card-text>
          <ul>
            <li>
              タイマーの
              <ul>
                <li>開始1分前</li>
                <li>開始時</li>
                <li>終了1分前</li>
                <li>終了時</li>
              </ul>
              のタイミングで通知及びカウントダウンがされます
            </li>
            <li>
              一度通知設定をしていれば、ブラウザを閉じていても通知されます
            </li>
            <li>
              アクティブ時（このページを閲覧している時）はページ内で通知され、非アクティブ時はプッシュ通知されます
            </li>
          </ul>
        </v-card-text>
      </v-card>
      <br>
      <v-card>
        <v-card-title class="headline">
          Settings
        </v-card-title>
        <v-card-text>
          <ul>
            <li>
              ページを開いた際のダイアログで通知の許可をしてください
            </li>
            <li>
              もし閉じてしまったり拒否をしてしまった場合は、以下画像を参考にURLバーの鍵アイコンをクリックし、通知「許可」に変更してください
            </li>
            <li>
              逆に通知を切りたい時も、同様の操作で「ブロック」を選択してください
            </li>
          </ul>
          <img src="images/notification.png" width="300" height="179">
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/messaging'

export default {
  data () {
    return {
      timers: [],
      now_time: null,
      diff: null,
      message: ''
    }
  },
  beforeMount () {
    this.setTime()
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
    messaging.onMessage((payload) => {
      this.message = `【${payload.notification.title}】${payload.notification.body}`
      setTimeout(this.clearMessage, 3000)
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
    dateFormat (time) {
      const date = new Date(time)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
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
    isToday (time) {
      const t1 = new Date(this.now_time)
      const t2 = new Date(time)
      return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate()
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
    },
    async setTime () {
      const response = await this.$axios.get('https://lt-timer-go.herokuapp.com/api/timers')
      const clientTime = new Date()
      const serverTime = new Date(response.headers.date)
      const diff = serverTime.getTime() - clientTime.getTime() + 1000 // 時刻の微妙なズレ1秒加算

      this.timers = response.data
      this.now_time = new Date()
      this.diff = diff
    },
    clearMessage () {
      this.message = ''
    }
  }
}
</script>
