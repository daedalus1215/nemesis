# nemesis-react

## Desktop and Android apps

Tauri packages the React build into an Android app and a desktop app (Linux,
macOS), both from `src-tauri/`. The apps carry their own copy of the UI and
talk to a Nemesis server over the network. On first launch they ask for the
server's address and, if Cloudflare Access protects the server, an Access
service token: Access's sign-in page is meant for browsers, so the apps get
through with the token instead. Logging in to Nemesis then works as on the
web. **Server settings** on the login screen, or **Connection** in Settings,
changes them later. If Access turns the token away, the app opens the
connection settings and says so, rather than signing you out.

```bash
npm run desktop:dev     # desktop app against the Vite dev server
npm run desktop:build   # release build: src-tauri/target/release/nemesis-desktop,
                        # plus .deb, .rpm and AppImage bundles
npm run build:tauri     # the web build the apps ship (no service worker)
npm run icons           # redraw the desktop and Android icons from src/assets/nemesis.svg
npm test                # unit tests (vitest)
```

Linux builds need WebKitGTK and friends (`libwebkit2gtk-4.1-dev`,
`librsvg2-dev`; on Arch, `webkit2gtk-4.1 librsvg`) and Rust 1.90 or later.
The app-only code is in `src/tauri/`; on the web it does nothing.

The token is entered on the device, never built into the app: anyone signed in
to GitHub can download this repo's CI artifacts. To make one, create a service
token in Cloudflare Zero Trust, then add a policy to Nemesis's Access
application with the **Service Auth** action that includes it. Leave both
token fields blank for a server Access doesn't protect, such as a dev server on
plain HTTP.

### Android

The app is `com.nemesis.app` (arm64). CI builds it as a signed release APK
when you push a version tag:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

`.github/workflows/tauri-android-release.yml` then attaches
`nemesis-0.2.0.apk` to a GitHub Release (Actions → Run workflow builds one
without publishing it). Install it by opening the APK on the phone, or with
`gh release download v0.2.0 --repo daedalus1215/nemesis -p '*.apk'` and
`adb install -r nemesis-0.2.0.apk`. Being a release build, nothing connected
over USB can read what the app stores (`run-as`, the WebView inspector).

Pull requests build the debug app (`com.nemesis.app.debug`,
`tauri-android-build.yml`; Run workflow builds one from any branch), which
installs beside the release one. Download the `nemesis-android-debug-apk`
artifact and `adb install -r` it.

Each build installs over the last, keeping its data, only because they're all
signed with the same key. The keys live in the repository secrets:

| Secret | What |
|--------|------|
| `ANDROID_RELEASE_KEYSTORE_BASE64` | the release keystore (alias `nemesis-release`), base64-encoded |
| `ANDROID_RELEASE_KEYSTORE_PASSWORD` | its password |
| `ANDROID_DEBUG_KEYSTORE_BASE64` | the debug keystore (alias `androiddebugkey`, password `android`), base64-encoded |

The release workflow refuses to publish an APK whose certificate doesn't match
the fingerprint it pins (`RELEASE_CERT_SHA256`), and the debug one checks the
APK was signed with the secret's key. Keep a backup of both keystores
(`~/.android/nemesis-*` on the machine that made them): an app signed with a
different key won't install over the old one without uninstalling it, which
loses what's stored on the phone. The `ANDROID_SERVER_URL` repository
variable prefills the address on the first-launch screen.

The status and navigation bars are always dark, matching Nemesis's default
theme: they don't follow the theme chosen in Settings.

Building the Android app locally needs the Android SDK and NDK 27
(`NDK_HOME`), then `npx tauri android build --debug --apk --target aarch64`.
