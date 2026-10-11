# TypePop Pals — Expo app

The TypePop idle-companion, rebuilt as a real app. ENFP blob "Pip" idles,
wanders, naps and chats in a cozy room — procedural animation via
`react-native-reanimated` (breathing idle, blink loop, tap
squash-and-stretch, wander wobble, nap Z's, spin), behavior scheduler ported
from `../prototype/game.js`, mood bubbles, 4-mood feeling check-in, bond
meter (AsyncStorage), and real-clock day/night tint.

## Run it

```sh
cd app
npx expo start
```

- **Expo Go**: scan the QR code with the Expo Go app on your phone.
- **Web**: press `w` in the terminal, or `npx expo export --platform web`
  then serve `dist/`.
- **Simulator**: press `i` (iOS Simulator, needs Xcode/macOS) or `a`
  (Android emulator).

## Notes

- Blob art lives in `assets/blobs/` (converted to PNG — iOS doesn't decode
  webp in React Native by default).
- Per-type config in `src/types.ts`: ENFP, INTJ, ENFJ, ENTJ, ENTP, INFJ, and
  INFP fully wired with their own pose sets and distinct voices (tap the
  type chips on the companion screen to switch pal); the other 9 types are
  stubbed with placeholder poses until their v5 pose sets land.
- Animation is procedural (Reanimated springs/timings), structured so Rive
  `.riv` files can replace the procedural layer later without rewiring game
  logic.

## Next steps (EAS)

1. `npm install -g eas-cli && eas login`
2. `eas build:configure` — creates `eas.json`
3. `eas build --platform ios` / `--platform android` (cloud build, no Mac needed)
4. Push notifications: `expo-notifications` + Expo Push service
5. OTA updates: `eas update` — ship animation tweaks without App Store review
6. IAP: RevenueCat when monetization starts
