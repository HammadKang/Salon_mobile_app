<p align="center"><img src="assets/icon-1024.png" width="120" alt="Aurelle logo" /></p>

<h1 align="center">Aurelle Salon App</h1>

<p align="center">
A premium salon app for iOS and Android with online appointment booking.<br />
Built with React Native 0.87 (plain React Native CLI, no Expo) and TypeScript.
</p>

"Aurelle" is a sample brand. Branding, contact details, hours, services, team and offers live in a few configuration files, so the app can be re-branded for any salon without touching the UI code. It is the mobile companion to the [Aurelle salon website](https://github.com/HammadKang/salon) and shares its design language and booking logic.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Customisation](#customisation)
- [How booking works](#how-booking-works)
- [Design and motion](#design-and-motion)
- [Before releasing](#before-releasing)
- [Quality and verification](#quality-and-verification)

## Features

| Area | What it does |
|---|---|
| **Intro** | Full-screen animated splash. The logo draws itself, then the wordmark rises letter by letter. Tap to skip. |
| **Home** | Parallax hero, signature treatments, first-visit offer, team, testimonials, opening hours, one-tap call, WhatsApp and directions. |
| **Services** | Photo cards showing name, duration and starting price on the image, who performs the service, and a clear Book button. Category filters stay pinned while the list scrolls. |
| **Booking** | Five steps: service, stylist (or any available), date and time, details, review. Availability is calculated live from opening hours, service length and stylist days off. |
| **Confirmation** | Booking reference, a one-tap "Send to salon on WhatsApp" with the full booking pre-written, and a share option. |
| **Visit** | Upcoming bookings saved on the device, contact options, opening hours with today highlighted, FAQ and updates sign-up. |
| **Gallery** | Masonry portfolio with filters and a full-screen swipeable viewer. |
| **Team** | Stylist profiles with "Book with ..." shortcuts. |
| **Navigation** | Custom bottom bar with a sliding gold indicator and a label on the active tab only. |

## Tech stack

| Area | Technology |
|---|---|
| Framework | React Native 0.87, React 19, TypeScript |
| Navigation | React Navigation 7 (bottom tabs, native stack) |
| Storage | AsyncStorage |
| Graphics | react-native-svg, lucide-react-native |
| Animation | React Native `Animated` (native driver where possible) |
| Tests | Jest |

## Getting started

**Requirements**

- Node.js 22.11 or newer (required by React Native 0.87)
- iOS: macOS, Xcode, CocoaPods
- Android: Android Studio, JDK 17, an emulator or device

See the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) on a new machine.

**Run**

```bash
npm install
cd ios && pod install && cd ..    # iOS, first time only

npm start                         # Metro bundler
npm run ios                       # in a second terminal
npm run android
```

**Quality scripts**

```bash
npm test                          # unit tests
npm run lint
npx tsc --noEmit                  # type-check
```

## Project structure

```
App.tsx                      Providers, navigation root and the intro
src/
  config/salon.ts            Brand, contact, hours, offer and booking rules
  data/                      Services, stylists, gallery, testimonials, FAQs
  lib/                       Booking engine, storage, formatting, contact helpers
  context/AppContext.tsx     Saved bookings and offer state
  navigation/                Tab bar, tabs, stack and the useBook() helper
  screens/                   Home, Services, Gallery, Team, Visit, Booking
  brand/                     Logo geometry, logo components, animated splash
  components/                Button, Calendar, ServiceRow, Motion helpers, shared UI
assets/                      Logo and app icon artwork
__tests__/                   Booking engine tests
```

## Customisation

| To change | Edit |
|---|---|
| Name, phone, WhatsApp number, email, address, hours, offer, booking rules | `src/config/salon.ts` |
| Closed days and already-taken times | `closedDates`, `blockedSlots` in `src/config/salon.ts` |
| Services, durations, prices | `src/data/services.ts` |
| Team | `src/data/stylists.ts` |
| Gallery, testimonials, FAQs | `src/data/content.ts` |
| Photos | `src/lib/images.ts` (Unsplash ids) or local images |
| Colours and typography | `src/theme.ts` |
| Logo | `src/brand/geometry.ts`, `src/brand/Logo.tsx`, `assets/logo.svg` |
| Intro animation | `src/brand/Splash.tsx` |
| App icon | `ios/.../AppIcon.appiconset`, `android/.../mipmap-*` |

Opening hours, service durations and stylist days off feed the booking engine directly, so changing them changes which times customers can choose.

## How booking works

The app has no backend. Everything runs on the phone.

1. **Live availability** is computed from opening hours, service duration, stylist working days, minimum notice and the booking window. The salon time zone is a fixed UTC offset in the config.
2. **Confirmation:** the customer sees a reference such as `AUR-7KD4M2` and a full summary.
3. **Delivery:** "Send to salon on WhatsApp" opens WhatsApp with the whole booking pre-written. The salon receives it on its own number and confirms the slot.
4. **Persistence:** bookings are saved with AsyncStorage, so they survive restarts, and the same slot cannot be booked twice from one phone.

**Limitations**

- Availability is not shared between customers. Two people can pick the same time; the salon resolves it when the WhatsApp message arrives. The app therefore says "booking received" and asks the customer to send it, rather than claiming the salon has confirmed.
- Keep the calendar aligned with the real diary by updating `closedDates` and `blockedSlots` and releasing an update.
- A shared live diary and automatic notifications to the salon need a backend. The booking logic in `src/lib/engine.ts` is independent of the UI so one can be added later.

## Design and motion

- **Identity:** warm ivory, champagne and ink with restrained gold, an editorial serif for headings and a clean sans for body text.
- **Logo:** a mirror-shaped arch holding a monogram "A" whose crossbar is a strand of hair, with a small spark. The same geometry drives the in-app logo, the self-drawing intro and the app icons.
- **Intro:** glow, pulsing rings, drifting gold dust, then the logo draws itself. The native launch screen, window and root view use the brand colour so there is no white flash before it.
- **Motion:** scroll-triggered section reveals, counting statistics, press feedback on cards and buttons, a sliding tab indicator, and a check mark that draws itself with a sparkle burst on confirmation.
- **Accessibility:** roles, labels and states on interactive elements, 44 pt minimum touch targets, announced form errors, and the intro respects the system "Reduce Motion" setting.

## Before releasing

The following are placeholders and must be replaced with real information:

- Address (a Karachi example), email domain, prices, team names and portraits, and the three testimonials. Publish only genuine client reviews.
- The 10% first-visit offer is a sample. The booking records the code and the salon decides eligibility at the visit. Set `offer.enabled` to `false` if there is none.
- Photography comes from Unsplash for demonstration. Confirm licensing or use the salon's own photos.
- Change the iOS bundle identifier (`org.reactjs.native.example.Salon-mobile-app`) and the Android `applicationId`, and set up signing, before publishing to the stores.
- Headings use the system serif (Baskerville on iOS). Bundle a font such as Cormorant Garamond for an exact match with the website.

## Quality and verification

**Verified**

- Type-check, lint and 10 unit tests pass.
- The JavaScript bundle builds for both iOS and Android.
- Built and run on the iOS Simulator (iPhone 17 Pro): the intro animation (frame by frame), Home, Services with category filtering, the full booking flow with validation and confirmation, bookings persisting after a restart, the gallery viewer, the welcome offer, and the custom tab bar.

**Not yet verified**

- A full Android build and run. The SDK is set up and a debug build was started, but it has not been confirmed to finish and has not been run on an emulator or device, so Android behaviour, including the custom tab bar and the intro, is untested.
- Small phones, tablets, and VoiceOver / TalkBack behaviour.
- Animation smoothness on a physical device.
