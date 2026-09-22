/* ---------------------------------------------------------------
   Firebase settings.

   Paste the config object from your Firebase project here (see
   README.md — it takes about five minutes to set up). Until you do,
   the demo falls back to the local Python server, and then to this
   browser's own storage, so it always works.

   These values are NOT secrets. Firebase web config is public by
   design; what protects the data is the security rules, which are
   in README.md.
   Note: the Firebase console shows a couple of `import ...` lines
   above this object. Do NOT paste those — they are for projects built
   with npm. This page loads the SDK straight from Google's CDN, and an
   `import` line in a plain <script> stops the whole file from running.
   --------------------------------------------------------------- */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAkCkmzK27S-F45kOZ_Ue7wuxWzI61rLpM",
  authDomain: "scie2020-survey-mit-ed.firebaseapp.com",
  projectId: "scie2020-survey-mit-ed",
  storageBucket: "scie2020-survey-mit-ed.firebasestorage.app",
  messagingSenderId: "1005156025473",
  appId: "1:1005156025473:web:4b29b74ab9157abcd13980",
  measurementId: "G-CSPBRFT9XZ"
};

/* ---------------------------------------------------------------
   Which class is answering.

   By default each calendar day is its own class: Tuesday's answers
   and Wednesday's answers never mix, and next term starts empty
   without deleting anything.

   To run two separate groups on the same day, add a code to the URL
   that you give the students:  ...:8975/?class=tuesday
   --------------------------------------------------------------- */

const CLASS_SESSION =
  new URLSearchParams(location.search).get("class") ||
  new Date().toLocaleDateString("en-CA");   // e.g. "2026-09-22"
