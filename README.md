# Royal Crest Hotel: Mobile App

A cross-platform hotel booking app for **Android and iOS**, built with React Native and Expo.

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS-lightgrey)

</div>

---

## Overview

The Royal Crest Hotel mobile app gives guests and staff access to the hotel booking system from their phones. Customers can find and book a stay in a few taps. Administrators can track occupancy and revenue, and manage rooms, bookings and users.

The app uses the same **FastAPI backend** as the Royal Crest Hotel website.

## Features

### Customers
- 🔐 **Account registration and login**, with optional **fingerprint / Face ID** sign-in
- 🛏️ **Room browsing**: room types, amenities, photos and nightly rates
- 📅 **Availability search** by check-in, check-out and number of guests
- 💳 **Booking**: the server calculates the price, including 12% tax
- 📋 **Booking history** with status tracking (Pending, Confirmed, Checked in, Checked out, Cancelled)
- ❌ **Cancellation** of bookings that are still active
- 👤 **Profile and security**: edit details, change password, manage biometric devices
- 🌗 **Light and dark themes**

### Administrators
- 📊 **Dashboard**: occupancy, revenue, arrivals and departures for today, recent bookings
- 🏨 **Manage rooms**: add, edit and remove rooms and set their status
- 📖 **Manage bookings**: search, filter and update booking status
- 👥 **Manage users**: create, edit and suspend accounts, and reset biometric access

## Tech Stack

| Area | Technology |
|---|---|
| Framework | React Native 0.86 · React 19.2 · Expo SDK 57 |
| Language | TypeScript |
| Navigation | Expo Router (file-based; stack, drawer and tabs) |
| Server state | TanStack React Query |
| Client state | Zustand |
| UI | React Native Paper (Material Design) · React Native Calendars |
| Security | Expo SecureStore · Expo Local Authentication |
| Backend | FastAPI REST API (separate repository) |

## Architecture

The app is organised in **layers**. Each layer only talks to the one below it:

```
Screens (app/)  →  Hooks (src/hooks)  →  Services (src/services)  →  API client (src/api)  →  FastAPI
```

- **Screens** show the UI and handle what the user does.
- **Hooks** wrap React Query to cache data and refresh it after every change.
- **Services** call the API endpoints and convert the server's `snake_case` data into `camelCase` models.
- **The API client** adds the login token, renews expired tokens automatically, and turns every server error into one `ApiError` type.

**Role-based navigation:** after sign-in, each user is sent to their own area: customers to `/customer`, administrators to `/admin`. Route guards (`RequireAuth`, `RequireAdmin`, `RequireAnonymous`) keep users out of screens they can't use. The backend still checks permissions on every request.

**Design patterns used:** Singleton (shared API client, token store and query cache), Facade, Service layer, DTO/Mapper, Adapter, Observer, Provider and Guard.

## Project Structure

```
app/                     # Screens (Expo Router file-based routing)
├── _layout.tsx          # Root providers and session restore
├── index.tsx            # Redirects each user by role
├── auth/                # Login, register
├── customer/            # Drawer + tabs: find a stay, bookings, profile, rooms
│   ├── tabs/
│   ├── room/[id].tsx
│   └── booking/         # create, [id], confirmation
└── admin/               # Dashboard, manage rooms / bookings / users
src/
├── api/                 # apiClient, tokenStore, apiError
├── services/            # auth, room, booking, user, report, biometric
├── hooks/               # React Query hooks and theme hooks
├── store/               # Zustand auth store
├── components/          # Shared UI and route guards
├── context/             # Theme preference
├── types/               # Domain models
└── lib/                 # Config, query client, formatting
docs/
└── BACKEND_ISSUES.md    # Known backend issues the app works around
```

## Security & Validation

- **Tokens:** the access token is kept only in memory. The refresh token is kept in the device's secure storage (iOS Keychain / Android Keystore), and expired access tokens are renewed automatically.
- **Biometric sign-in** is checked on the device and on the server. Changing your fingerprints, or an admin reset, turns it off for that device.
- **Two levels of validation:** the app checks input first for instant feedback, and the server checks it again.
  - **Password:** 10+ characters, with an uppercase letter, a lowercase letter and a number
  - **Dates:** no past dates; check-out must be after check-in
  - **Guests:** limited to the room's maximum occupancy
  - **Double submits:** the Confirm button is disabled while a booking is being sent
- **Prices** are always calculated by the server.
- **Logout** clears all cached data, so the next user never sees the previous account's information.

## Getting Started

### Prerequisites
- Node.js 20 or newer
- Android Studio (for the Android emulator) or Xcode (for the iOS simulator, macOS only)
- The Royal Crest Hotel FastAPI backend, running locally or deployed

### Installation

```bash
git clone https://github.com/mjKas/Hotel_Booking_Mobile_App.git
cd Hotel_Booking_Mobile_App
npm install
```

### Configuration

Copy `.env.example` to `.env` and set the backend URL:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

| Running on | URL |
|---|---|
| Android emulator | `http://10.0.2.2:8000` |
| iOS simulator | `http://127.0.0.1:8000` |
| Physical device | `http://<your-computer-LAN-IP>:8000` |

### Run

```bash
npx expo start          # start the dev server
npm run android         # build and run on Android
npm run ios             # build and run on iOS
```

> Biometric sign-in uses native modules. To test it, run a **development build** (`npm run android` / `npm run ios`), not Expo Go.

### Build with EAS

```bash
eas build --profile preview --platform android
eas build --profile production --platform all
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run lint` | Run ESLint |

## Roadmap

- [ ] Push notifications for booking confirmations and status changes
- [ ] Form validation with shared Zod schemas
- [ ] Customer-only route guard for the customer area

## Team

Developed by Manuja and Ransike as part of the Royal Crest Hotel Booking System project.
