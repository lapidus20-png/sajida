# BuilderHub Mobile

BuilderHub mobile app built with Flutter - Connect clients with skilled artisans in Burkina Faso.

## Features

- **BuilderHub Branding** - Complete rebranding from "Artisan BF"
- **Burkina Faso Colors** - Red, Green, and Yellow color scheme
- **Beautiful Auth Screen** - Login and signup with user type selection
- **Home Screen** - Browse categories and top-rated artisans
- **Supabase Integration** - Connected to the same backend as web app

## Design

### Colors
- **Primary Red**: #EF2B2D (Burkina Faso flag red)
- **Primary Green**: #00A651 (Burkina Faso flag green)
- **Primary Yellow**: #FCD116 (Burkina Faso flag yellow)

### Screens
1. **Auth Screen** - Login/Signup with BuilderHub branding
2. **Home Tab** - Featured categories and top artisans
3. **Categories Tab** - Browse all categories
4. **Activity Tab** - User activity and history
5. **Profile Tab** - User profile and settings

## Setup

1. Install dependencies:
```bash
cd builderhub_mobile
flutter pub get
```

2. Run the app:
```bash
flutter run
```

## What's Different from flutter_app folder?

This is a FRESH implementation with:
- ✅ **No purple colors** - Uses Burkina Faso flag colors only
- ✅ **BuilderHub branding** - Not "Artisan BF"
- ✅ **Clean slate** - No cached old styles
- ✅ **Simplified structure** - Essential files only
- ✅ **Same database** - Connected to Supabase

## Folder Structure

```
builderhub_mobile/
├── lib/
│   ├── constants/
│   │   └── app_constants.dart      # BuilderHub colors & theme
│   ├── screens/
│   │   ├── auth/
│   │   │   └── auth_screen.dart    # Login/Signup
│   │   └── client/
│   │       └── client_home_screen.dart  # Main app
│   └── main.dart                   # App entry point
├── android/                        # Android configuration
└── pubspec.yaml                    # Dependencies
```

## Next Steps

1. Run `flutter pub get` to install dependencies
2. Run `flutter run` to launch the app
3. You'll see BuilderHub branding with red, green, and yellow colors
4. No more purple or "Artisan BF"!
