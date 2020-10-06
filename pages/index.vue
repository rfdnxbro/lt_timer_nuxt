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
              :color="get_color(timer)"
              small
            >
              <div>
                <div class="font-weight-normal">
                  {{ time_format(timer.starts_at) }}-{{ time_format(timer.ends_at) }}
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
        // console.log(token)
      })
      .catch(() => {
        alert('通知を利用できません。URLバーの鍵アイコンから通知を許可に設定してください。')
      })
  },
  methods: {
    time_format (time) {
      const date = new Date(time)
      return date.getHours() + ':' + ('00' + date.getMinutes()).slice(-2)
    },
    get_color (timer) {
      const current = new Date()
      const begin = new Date(timer.starts_at)
      const end = new Date(timer.ends_at)
      if (begin <= current && end >= current) {
        return 'red'
      }

      return 'white'
    }
  }
}
</script>
