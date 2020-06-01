const firebase = require('@firebase/app').default;
require('@firebase/firestore');



const config = {
  apiKey: "AIzaSyCfS4xHkf99GCwWL5yPkvvPzo6g0erQ8gw",
  authDomain: "dworkbackend.firebaseapp.com",
  databaseURL: "https://dworkbackend.firebaseio.com",
  projectId: "dworkbackend",
  storageBucket: "dworkbackend.appspot.com",
  messagingSenderId: "390252526049",
  appId: "1:390252526049:web:6172a60a694a54d24f7aa0"
}

firebase.initializeApp(config);

exports.firebase = firebase;
exports.database = firebase.firestore();

