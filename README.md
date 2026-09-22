# AI Survey — SCIE 2020 demo

Students answer the same questions MIT asked its community in 2026
(Report of MIT's Ad Hoc Committee on AI Use, Appendix C), then see the
class results side by side with MIT's.

---

## Where the answers are stored

The page tries three places, in order, and uses the first that works:

| | | |
|---|---|---|
| **1. Cloud** | Google Cloud Firestore | Recommended. Survives the laptop, the Wi-Fi and the term. Results update **live** as students submit. Needs the 5-minute setup below. |
| **2. Laptop** | `serve.py` → `data/responses.json` | Works with no setup, but only while the server is running and only for phones on the same Wi-Fi. |
| **3. Browser** | `localStorage` | Last resort, so the page still does something when opened straight off the disk. |

The results page always says which one it is using. **If you set up the
cloud and it fails, the page says so explicitly** rather than quietly
demoting itself — so if the line reads "Answers are saved in the cloud
and update live", it really is.

---

## Setting up the cloud database (about 5 minutes, once)

1. Go to <https://console.firebase.google.com> and sign in with a Google
   account. Click **Create a project**, name it (e.g. `scie2020-survey`),
   and turn Google Analytics **off** — you don't need it.
2. In the left menu open **Build → Firestore Database → Create database**.
   Choose a location near you (`northamerica-northeast2` is Toronto) and
   pick **Start in production mode** — the rules below replace the
   defaults anyway.
3. Open **Build → Authentication → Get started**, choose **Anonymous**
   in the list of providers, and enable it. This is what lets students
   submit without ever seeing a login screen. Skipping this step gives
   the error `auth/admin-restricted-operation`.
4. Go to **Project settings** (the gear, top left) → scroll to **Your
   apps** → click the **web** icon `</>`. Give it any nickname and
   register it. Firebase shows you a `firebaseConfig` object. Copy it
   into [`js/config.js`](js/config.js).

   > **Copy the object only.** Firebase shows two `import ...` lines
   > above it, for projects built with npm. This page loads the SDK
   > from Google's CDN instead, and an `import` line in a plain
   > `<script>` stops the whole file from running — the symptom is
   > "CLASS_SESSION is not defined" when a student presses Submit.
5. Back in **Firestore Database → Rules**, replace everything with the
   rules below and press **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /responses/{id} {
      // Students are signed in anonymously and invisibly, so this
      // keeps out anything that is not the survey page.
      allow read:   if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.size() < 20
                    && request.resource.data.session is string
                    && request.resource.data.session.size() <= 40
                    // Stops the survey accepting new answers after the
                    // term. Move the date on when you next teach it.
                    && request.time < timestamp.date(2026, 12, 31);
      allow delete: if request.auth != null;   // the "Clear all" button
      allow update: if false;                  // answers are never edited
    }
  }
}
```

That's it. Reload the page; the results line should now read
"Answers are saved in the cloud and update live."

**The values in `js/config.js` are not secrets.** Firebase web config is
public by design — it identifies the project, it does not grant access.
The rules above are what actually protect the data.

**Cost:** none. The free tier allows 50,000 reads and 20,000 writes a
day; a class of 40 uses a few hundred.

---

## Running it in class

```bash
python3 serve.py
```

It prints two addresses:

- `http://localhost:8975` — for you
- `http://<your laptop's IP>:8975` — for students on the same Wi-Fi

Students open the second one on their phones, fill in the survey, and
tap **Submit**. Open the **Class results** tab on the projector: with the
cloud database the bars grow by themselves as answers arrive.

Once the cloud is set up you no longer need `serve.py` at all — you can
drop this folder on any static host (Netlify, GitHub Pages) and give
students that link instead, which also sidesteps campus Wi-Fi blocking
phone-to-laptop connections.

### One class per day, automatically

Answers are tagged with the date, so Tuesday's group and Wednesday's
group never mix and next term starts empty without deleting anything.

To split two groups on the same day, add a code to the link you hand
out: `.../?class=tuesday` and `.../?class=wednesday`.

**Clear all responses** deletes only the current class's answers.
**Download** saves them as JSON.

---

## Files

- `index.html` — the page (survey + results views)
- `css/style.css`
- `js/config.js` — **your Firebase settings go here**; also sets the class session
- `js/questions.js` — every question, plus MIT's percentages
- `js/survey.js` — builds the form and submits it
- `js/results.js` — tallies answers and draws the bars
- `js/store.js` — the three storage tiers
- `js/app.js` — switches between the two views
- `serve.py` — static files + `/api/responses` (GET / POST / DELETE)
