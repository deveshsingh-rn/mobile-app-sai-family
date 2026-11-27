# OTA update ke liye GCP setup — DevOps steps

> **Status (2026-11-27): abhi nahi karna.** Abhi app EAS Update use kar raha hai (docs/ota-updates.md). Ye steps tab ke liye hain jab users badhne par GCP (Hot Updater) par shift karenge.

**Kis liye:** Sai Family app mein chhote code changes (bug fix, text, screen) bina App Store / Play Store release ke users tak bhejne ke liye. Iska server hamare GCP project par chalega: 1 Cloud Function + Firestore + 1 Storage bucket.

**Kharcha:** ~$20–30 / mahina (estimate). Company ke GCP credits se katega.

**Aapko kya karna hai:** sirf console mein clicks aur Cloud Shell mein 2 command paste. Koi key ya password share nahi karna. Function deploy, config aur app build Devesh ki taraf se honge.

**Samay:** ~15 minute.

---

## Step 1 — Project par Firebase chalu karo

1. https://console.firebase.google.com kholo (company wale Google account se).
2. **Create a project** dabao. Neeche likha hoga **"Add Firebase to Google Cloud project"** — us link par click karo.
3. List mein se project **`nth-fort-510807-q2`** chuno. Ye wahi project hai jisme `saifamily-bucket` hai.
4. **Google Analytics:** Off kar do (zaroorat nahi).
5. **Continue / Add Firebase** dabao aur 1 minute ruko.

## Step 2 — Blaze plan (billing) lagao

1. Firebase console mein neeche-baayein plan likha hoga (**Spark**). Uske paas **Upgrade** dabao.
2. **Blaze (pay as you go)** chuno.
3. Billing account mein **wahi account chuno jisme company ke credits hain**.
4. Budget alert maange to **$50** daal do (sirf alert email ke liye hai, kharcha nahi rokta).

> Credits check: GCP Console → **Billing → Credits** mein dekh lo ki credits **"all services"** ke liye hain, ya kam se kam **Cloud Functions, Cloud Run, Firestore, Cloud Storage** par lagte hain.

## Step 3 — Firestore database banao

1. Firebase console, left menu: **Build → Firestore Database → Create database**.
2. Edition puche to **Standard**.
3. **Database ID:** `(default)` hi rehne do.
4. **Location:** **`asia-south1 (Mumbai)`**. Ye baad mein badal nahi sakta, dhyan se chuno.
5. **Start in production mode** → **Create**.

## Step 4 — Storage bucket banao

1. Firebase console, left menu: **Build → Storage → Get started**.
2. **Location:** **`asia-south1 (Mumbai)`**.
3. **Start in production mode** → **Done**.
4. Upar bucket ka naam dikhega, jaise `gs://nth-fort-510807-q2.firebasestorage.app`. **Ye naam note kar lo** (Step 7 mein bhejna hai).

## Step 5 — Zaroori APIs chalu karo (1 command)

GCP Console (https://console.cloud.google.com) mein upar-daayein **Cloud Shell** icon (`>_`) dabao, ye command paste karke Enter dabao:

```bash
gcloud services enable \
  cloudfunctions.googleapis.com run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com firestore.googleapis.com storage.googleapis.com \
  firebase.googleapis.com iam.googleapis.com \
  --project nth-fort-510807-q2
```

1–2 minute lagenge. Aakhir mein `Operation ... finished successfully` aayega.

## Step 6 — Devesh ko is project par access do (1 command)

Usi Cloud Shell mein ye paste karo:

```bash
for ROLE in roles/firebase.admin roles/cloudfunctions.admin roles/run.admin \
  roles/cloudbuild.builds.editor roles/artifactregistry.writer \
  roles/iam.serviceAccountUser roles/resourcemanager.projectIamAdmin \
  roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding nth-fort-510807-q2 \
    --member="user:devesh.singh@sustaininsight.com" --role="$ROLE" --condition=None
done
```

Ye roles kyun chahiye:

| Role | Kyun |
|---|---|
| firebase.admin | Firestore index aur Storage setup |
| cloudfunctions.admin + run.admin | update-server function deploy karna |
| cloudbuild.builds.editor + artifactregistry.writer | function build hota hai |
| iam.serviceAccountUser | function ko uske service account se chalana |
| resourcemanager.projectIamAdmin | setup tool function ke service account ko ek permission deta hai |
| serviceusage.serviceUsageConsumer | upar wali APIs use karna |

> `projectIamAdmin` dene mein dikkat ho to mat do. Setup ke baad hum aapko ek line ka command bhej denge, wo aap khud chala dena.

## Step 7 — Devesh ko ye bhejo

```
Project ID: nth-fort-510807-q2
Blaze plan: done (credits wala billing account)
Firestore: done (asia-south1)
Storage bucket: <Step 4 wala naam>
APIs: done
Access: done
```

Bas. Iske baad Devesh apne laptop se setup chalayega aur app build karega.

---

### Agar kuch atke

| Dikkat | Kya karein |
|---|---|
| Step 1 mein project list mein nahi dikha | Us Google account ko project par Owner/Editor access chahiye; sahi account se login karo |
| Step 2 mein credits wala billing account nahi dikha | Billing account par aapke paas *Billing Account User* role hona chahiye |
| Step 3/4 mein `asia-south1` nahi dikha | Location dropdown mein "Mumbai" search karo |
| Step 6 mein `PERMISSION_DENIED` | Ye command project Owner chalaye |
