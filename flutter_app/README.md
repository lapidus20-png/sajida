# Artisan BF - Flutter Mobile App

Connect clients with skilled artisans in Burkina Faso. Available for Android and iOS (Windows support coming soon).

## Features

- **Client Dashboard**: Post jobs, find artisans, track projects
- **Artisan Dashboard**: Browse available jobs, send quotes, manage projects
- **Admin Dashboard**: Manage users, verify artisans, monitor platform
- **Real-time Notifications**: Stay updated on job status and messages
- **Geolocation**: Find nearby artisans with Google Maps integration
- **Secure Payments**: Integrated wallet system with multiple payment methods
- **File Upload**: Share project photos and documents
- **Review System**: Rate and review artisans

## Prerequisites

Before you begin, ensure you have:

1. **Flutter SDK** (3.0.0 or higher)
   - Download from: https://flutter.dev/docs/get-started/install
   - Add Flutter to your PATH

2. **Android Studio** (for Android development)
   - Download from: https://developer.android.com/studio
   - Install Android SDK and emulator

3. **Xcode** (for iOS development, Mac only)
   - Download from Mac App Store
   - Install iOS simulator

4. **Supabase Account**
   - Your existing Supabase project is ready to use

## Setup Instructions

### 1. Install Flutter

**Windows:**
```bash
# Download Flutter from https://flutter.dev
# Extract to C:\flutter
# Add C:\flutter\bin to your PATH

flutter doctor
```

**Mac/Linux:**
```bash
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
```

### 2. Configure Environment Variables

Copy your Supabase credentials:

```bash
cd flutter_app
cp .env.example .env
```

Edit `.env` and add your credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

```bash
cd flutter_app
flutter pub get
```

### 4. Configure Google Maps (Optional)

To enable map features, add your Google Maps API key:

1. Get API key from: https://console.cloud.google.com
2. Edit `android/app/src/main/AndroidManifest.xml`
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key

For iOS, edit `ios/Runner/AppDelegate.swift` and add your key.

### 5. Run the App

**On Android Emulator:**
```bash
flutter run
```

**On Physical Device:**
```bash
# Enable USB debugging on your Android phone
# Connect via USB
flutter devices  # Check if device is detected
flutter run
```

**On iOS Simulator (Mac only):**
```bash
open -a Simulator
flutter run
```

## Building for Production

### Android APK

```bash
flutter build apk --release
```

The APK will be at: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

### iOS App (Mac only)

```bash
flutter build ios --release
```

## Project Structure

```
flutter_app/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── screens/
│   │   ├── auth/                 # Login/signup screens
│   │   ├── client/               # Client dashboard screens
│   │   ├── artisan/              # Artisan dashboard screens
│   │   ├── admin/                # Admin dashboard screens
│   │   └── main_navigation.dart  # Main router
│   ├── services/
│   │   └── auth_service.dart     # Authentication service
│   └── models/                   # Data models
├── android/                      # Android configuration
├── ios/                          # iOS configuration
└── pubspec.yaml                  # Dependencies
```

## Running with Environment Variables

Flutter needs compile-time environment variables. Run with:

```bash
flutter run --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

Or configure in VS Code `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "artisan_bf",
      "request": "launch",
      "type": "dart",
      "args": [
        "--dart-define=SUPABASE_URL=your_url",
        "--dart-define=SUPABASE_ANON_KEY=your_key"
      ]
    }
  ]
}
```

## Troubleshooting

### "Flutter not found"
Add Flutter to PATH or use full path: `C:\flutter\bin\flutter`

### Android license issues
```bash
flutter doctor --android-licenses
```

### iOS CocoaPods issues (Mac)
```bash
cd ios
pod install
cd ..
flutter run
```

### Build errors
```bash
flutter clean
flutter pub get
flutter run
```

## Database

The app uses your existing Supabase database with tables:
- `users` - User accounts
- `artisans` - Artisan profiles
- `demandes_travaux` - Job postings
- `devis` - Quotes
- `messages` - Chat messages
- `notifications` - Push notifications

All RLS policies are already configured.

## Features Roadmap

- [x] Authentication (login/signup)
- [x] Client dashboard
- [x] Artisan dashboard
- [x] Admin dashboard
- [x] Job posting
- [x] Browse artisans
- [ ] Send quotes
- [ ] Geolocation & maps
- [ ] File uploads
- [ ] Payment integration
- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Review system
- [ ] Multi-language support (French/Polish)

## Support

For help:
1. Check Flutter documentation: https://flutter.dev/docs
2. Review Supabase docs: https://supabase.com/docs
3. Check existing issues in the project

## License

Proprietary - Artisan BF Platform
