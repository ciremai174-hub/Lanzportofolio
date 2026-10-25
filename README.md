<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b9a8f205-8441-4b66-917e-049ad798c440

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Admin Full Access

Buka route admin `/LanzPortofolio` (login tetap menggunakan Firebase Auth). Setelah masuk, gunakan tab Hero & Identitas, Menu & Navigasi, Media Sosial, Album & Galeri, Keahlian, Profil & Visi, dan Website Builder. Website Builder mengatur metadata, tema global, custom CSS, urutan/visibilitas section, serta Page Builder untuk menambah, mengedit, mengaktifkan/menonaktifkan, menghapus, dan mengatur section custom berisi eyebrow, judul, paragraf, gambar, tombol, link, dan warna latar. Tekan tombol simpan ke Firestore untuk menerapkan perubahan.

Catatan build: dependency install/build belum berhasil dijalankan di lingkungan pembuatan ZIP, jadi lakukan `npm install` lalu `npm run build` di lingkungan pengembangan sebelum deploy.

## Full Access Admin V5

Panel admin tersedia pada route `/LanzPortofolio` (atau `#/LanzPortofolio`). Tab **FULL ACCESS ADMIN • ALL CONTENT** mencakup metadata/SEO, kontak situs, tema global, custom CSS, urutan dan visibilitas section, custom page builder, serta editor teks statis untuk bagian navbar, hero, album, skill, profil, kontak, dan footer. Konten dinamis seperti project/album, skill, navigasi, profil, dan tautan sosial tetap diedit melalui tab masing-masing atau Advanced JSON.

Perubahan disimpan menggunakan tombol **SIMPAN KE FIRESTORE** yang sudah ada. Agar sinkronisasi lintas perangkat aktif, konfigurasi Firebase dan Firestore Rules harus benar pada proyek milik Anda. CSS khusus dapat mengubah tampilan lebih luas; hanya gunakan CSS yang Anda percaya.

## Final CMS fixes

- Advanced JSON editor now refreshes from the current draft after edits in any dedicated admin tab, preventing accidental application of stale JSON.
- JSON apply validates the required top-level data collections before replacing the draft.
- Skills-section helper labels can be customized in the Full Access text editor.
- Disabled navigation entries (`active: false`) are hidden from desktop and mobile navigation.
- Admin management now clearly grants permissions to an existing Firebase Authentication email; it no longer asks for a password that the form did not use to create an account.
- The login UI uses a generic email placeholder; no private administrator address is embedded in the source workspace.

## Before deployment

Install dependencies in a network-enabled development environment (`npm install`), then run `npm run build`. In the packaging environment dependency installation timed out, so the production build could not be verified here. Ensure Firebase Authentication contains the intended admin account before adding that email to the `admins` collection.


### Admin login troubleshooting
Firebase Authentication registration alone does not authorize dashboard access. Create a Firestore document in the same Firebase project and database at `admins/<email-lowercase>`, for example document ID `admin@example.com`, with fields `email: "admin@example.com"` and `role: "admin"`. Use the exact account email in lowercase for both the document ID and `email` field. The Firestore rules normalize the authenticated email to lowercase for authorization. Publish `firestore.rules` to the Firebase project used by this deployment.


## Admin login fix (single owner)

The admin allowlist is currently set to `lanzelit18@gmail.com` in both `src/services/firestoreService.ts` and `firestore.rules`. Sign in with that exact Google account (or its Firebase Auth email/password account). To activate Firestore writes, publish the included `firestore.rules` in Firebase Console → Firestore Database → Rules. Make sure the selected Firebase project is `portofoliolanz`. This source change does not deploy rules to Firebase automatically. Do not add an open/public rule as a workaround.
