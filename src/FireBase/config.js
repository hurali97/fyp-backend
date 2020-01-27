const firebase = require('@firebase/app').default;
require('@firebase/firestore');



const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: "dworkbackend",
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId
}

firebase.initializeApp(config);


exports.database = firebase.firestore();

