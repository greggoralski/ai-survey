/* ---------------------------------------------------------------
   Where the answers live.

   Three tiers, picked automatically at start-up:

   1. "cloud"  — Google Cloud Firestore. Used when js/config.js has a
                 project in it. Answers live in Google's database, so
                 they survive the laptop, the Wi-Fi and the term, and
                 every open results page updates the moment a student
                 submits.
   2. "server" — the local Python server (serve.py), writing to
                 data/responses.json.
   3. "local"  — this browser only, so the page still does something
                 when it is opened straight off the disk.

   Each tier is tried in turn, so nothing has to be configured for
   the demo to run.
   --------------------------------------------------------------- */

const Store = (() => {
  /* js/config.js supplies these. It can be missing — an old page held
     in a browser cache, a folder copied without it — and a student
     pressing Submit is the worst possible moment to find out, so read
     it defensively and carry on with sensible defaults. */
  const missingConfig = typeof CLASS_SESSION === "undefined";
  const SESSION =
    (typeof CLASS_SESSION === "string" && CLASS_SESSION) ||
    new URLSearchParams(location.search).get("class") ||
    new Date().toLocaleDateString("en-CA");
  const CONFIG = (typeof FIREBASE_CONFIG === "object" && FIREBASE_CONFIG) || null;

  const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
  const COLLECTION = "responses";
  const API = "api/responses";
  const LOCAL_KEY = "ai-survey-responses";

  let mode = null;      // "cloud" | "server" | "local"
  let problem = "";     // set when the cloud was configured but would not start
  let fb = null;        // { fs, db, col, query } once Firestore is up
  let ready = null;     // the one-time start-up promise

  /* ---------- tier 1: Firestore ---------- */
  async function startCloud() {
    if (!(CONFIG && CONFIG.projectId)) return false;
    const [app, auth, fs] = await Promise.all([
      import(SDK + "firebase-app.js"),
      import(SDK + "firebase-auth.js"),
      import(SDK + "firebase-firestore.js")
    ]);
    const a = app.initializeApp(CONFIG);
    // Students never sign in; this is an invisible anonymous account
    // that lets the security rules refuse everyone else.
    await auth.signInAnonymously(auth.getAuth(a));
    const db = fs.getFirestore(a);
    const col = fs.collection(db, COLLECTION);
    fb = { fs, db, col, query: fs.query(col, fs.where("session", "==", SESSION)) };
    return true;
  }

  /* ---------- tier 2: the Python server ---------- */
  async function serverAlive() {
    try {
      const r = await fetch(API, { cache: "no-store" });
      return r.ok;
    } catch (e) {
      return false;
    }
  }

  /* ---------- tier 3: this browser ---------- */
  function localRead() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]")
        .filter(r => r.session === SESSION);
    } catch (e) { return []; }
  }
  function localWriteAll(rows) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(rows)); } catch (e) {}
  }
  function localAll() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
    catch (e) { return []; }
  }

  /* ---------- pick a tier, once ---------- */
  function detect() {
    if (ready) return ready;
    ready = (async () => {
      try {
        if (await startCloud()) return (mode = "cloud");
      } catch (e) {
        // Configured but not working — say so rather than quietly
        // scattering the class's answers across their phones.
        problem = e.message || String(e);
      }
      mode = (await serverAlive()) ? "server" : "local";
      return mode;
    })();
    return ready;
  }

  /* Newest last, whichever tier answered. */
  const byTime = rows => rows.slice().sort((a, b) => String(a.ts).localeCompare(String(b.ts)));

  async function all() {
    const m = await detect();
    if (m === "cloud") {
      const snap = await fb.fs.getDocs(fb.query);
      return byTime(snap.docs.map(d => d.data()));
    }
    if (m === "server") {
      const r = await fetch(API, { cache: "no-store" });
      return byTime((await r.json()).filter(x => x.session === SESSION));
    }
    return byTime(localRead());
  }

  async function add(row) {
    const m = await detect();
    const entry = Object.assign({ session: SESSION }, row);
    if (m === "cloud") {
      await fb.fs.addDoc(fb.col, entry);
      return;
    }
    if (m === "server") {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      if (!r.ok) throw new Error("the class server refused the answer");
      return;
    }
    const rows = localAll();
    rows.push(entry);
    localWriteAll(rows);
  }

  async function clear() {
    const m = await detect();
    if (m === "cloud") {
      const snap = await fb.fs.getDocs(fb.query);
      await Promise.all(snap.docs.map(d => fb.fs.deleteDoc(d.ref)));
      return;
    }
    if (m === "server") {
      await fetch(API, { method: "DELETE" });
      return;
    }
    localWriteAll(localAll().filter(r => r.session !== SESSION));
  }

  /* Live updates, cloud only. Returns a stop function, or null when
     this tier cannot push — the caller then uses the Refresh button. */
  async function subscribe(onRows) {
    if (await detect() !== "cloud") return null;
    return fb.fs.onSnapshot(fb.query, snap => onRows(byTime(snap.docs.map(d => d.data()))));
  }

  /* One sentence for the results page, explaining where answers went.
     If the cloud was configured but would not start, that is said out
     loud whichever tier caught the fall — a quiet demotion to the
     laptop is exactly the surprise you do not want mid-class. */
  async function describe() {
    const m = await detect();
    const which = `Class: ${SESSION}.`;
    const warn = missingConfig
      ? " Note: js/config.js did not load — this page may be a cached copy, so reload it (Shift-Reload)."
      : problem ? ` Note: the cloud database did not start (${problem}).` : "";
    if (m === "cloud") return `${which} Answers are saved in the cloud and update live.`;
    if (m === "server") return `${which} Answers are shared through the class server on this laptop.${warn}`;
    return problem
      ? `${which} Answers are stored in this browser only.${warn}`
      : `${which} No database or class server found — answers are stored in this browser only.`;
  }

  return { detect, all, add, clear, subscribe, describe };
})();
