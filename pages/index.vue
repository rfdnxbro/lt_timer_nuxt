<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          LT Timer
        </v-card-title>
        <v-card-text>
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
                  <strong>{{ timer.title }}</strong>
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
    const response = await $axios.$get('https://lt-timer-go.herokuapp.com/api/timers')
    return {
      timers: response
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
  methods: {
    timeFormat (time) {
      const date = new Date(time)
      return date.getHours() + ':' + ('00' + date.getMinutes()).slice(-2)
    },
    getColor (timer) {
      const current = new Date()
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
    async postToken (token) {
      const response = await this.$axios.$post('https://lt-timer-go.herokuapp.com/api/tokens', { token })
      return response
    }
  }
}
</script>
