import firebase from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDD8ZOKDGEEz0ymZ7tFVIWvN3ojCpLGkw0",
    authDomain: "ssf2-keyboard.firebaseapp.com",
    databaseURL: "https://ssf2-keyboard.firebaseio.com",
    projectId: "ssf2-keyboard",
    storageBucket: "ssf2-keyboard.appspot.com",
    messagingSenderId: "362899655935",
    appId: "1:362899655935:web:37709279e07e2e9ba4d0ca"
};
firebase.initializeApp(firebaseConfig);

export const baseUrl = 'https://as-f.github.io/keyboard';
