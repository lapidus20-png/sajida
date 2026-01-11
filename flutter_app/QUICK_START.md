# Quick Start Guide - Artisan BF Flutter App

## Step 1: Install Flutter (One Time Setup)

### Windows:
1. Download Flutter: https://docs.flutter.dev/get-started/install/windows
2. Extract to `C:\flutter`
3. Add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" under System Variables
   - Add: `C:\flutter\bin`
4. Open new Command Prompt and run:
   ```
   flutter doctor
   ```

### Alternative - Use Android Studio:
1. Install Android Studio: https://developer.android.com/studio
2. In Android Studio, go to **Plugins** and install **Flutter** plugin
3. Flutter SDK will be installed automatically

## Step 2: Setup Your Environment

1. Navigate to flutter_app folder:
   ```
   cd "C:\Artisan BF\flutter_app"
   ```

2. Copy your Supabase credentials from the `.env` file in the parent folder

3. Create a `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

4. Install dependencies:
   ```
   flutter pub get
   ```

## Step 3: Run the App

### Option A: Using Command Line

```bash
cd "C:\Artisan BF\flutter_app"

flutter run --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

Replace `your_url` and `your_key` with your actual Supabase credentials.

### Option B: Using Android Studio

1. Open Android Studio
2. Click "Open" and select the `flutter_app` folder
3. Create a new emulator (Tools > Device Manager)
4. Edit run configuration to add environment variables
5. Click the green play button

### Option C: Using VS Code

1. Install Flutter extension in VS Code
2. Open the `flutter_app` folder
3. Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Artisan BF",
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
4. Press F5 to run

## Step 4: Test on Your Phone

1. Enable Developer Options on your Android phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. Connect phone via USB cable

3. Run:
   ```
   flutter devices
   ```
   You should see your phone listed

4. Run the app:
   ```
   flutter run
   ```

## Step 5: Build APK for Distribution

To create an APK file you can share:

```bash
cd "C:\Artisan BF\flutter_app"
flutter build apk --release --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

The APK will be at:
```
build\app\outputs\flutter-apk\app-release.apk
```

Transfer this file to any Android phone and install it.

## Common Issues

### "flutter: command not found"
- Restart your terminal/command prompt after adding Flutter to PATH
- Or use full path: `C:\flutter\bin\flutter`

### "Android licenses not accepted"
```bash
flutter doctor --android-licenses
```
Accept all licenses by typing 'y'

### "No devices found"
- Make sure an emulator is running OR
- Your phone is connected with USB debugging enabled

### Build errors
```bash
flutter clean
flutter pub get
flutter run
```

## What You Have Now

A fully functional mobile app with:

- Login/Signup for Clients, Artisans, and Admins
- Client Dashboard to post jobs and find artisans
- Artisan Dashboard to browse jobs and send quotes
- Admin Dashboard to manage the platform
- Connected to your existing Supabase database

## Next Steps

The basic app is ready. You can now add:
- Google Maps integration for location features
- File upload for project photos
- Payment integration
- Real-time chat
- Push notifications

Check the README.md for detailed documentation.

## Need Help?

1. Run `flutter doctor` to check your setup
2. Check Flutter documentation: https://flutter.dev/docs
3. Verify your Supabase credentials are correct
