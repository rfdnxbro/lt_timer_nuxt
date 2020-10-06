/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/7.22.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.22.0/firebase-messaging.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDiU4XzMAyTIkfXyPIfIlcZZ2j3oL6nC4s',
  authDomain: 'lt-timer-e8850.firebaseapp.com',
  databaseURL: 'https://lt-timer-e8850.firebaseio.com',
  projectId: 'lt-timer-e8850',
  storageBucket: 'lt-timer-e8850.appspot.com',
  messagingSenderId: '729015977581',
  appId: '1:729015977581:web:7f086403831ce79f702164',
  measurementId: 'G-KNR201NLSX'
})

const messaging = firebase.messaging()
