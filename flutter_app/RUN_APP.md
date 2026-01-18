# 🎯 HOW TO RUN YOUR FLUTTER APP

## 📍 YOUR PROJECT LOCATION

Your Flutter app is located inside the `flutter_app` folder of your main project:

```
your-project/
└── flutter_app/          ← Your Flutter mobile app is HERE!
    ├── lib/
    ├── android/
    ├── pubspec.yaml
    └── ...
```

---

## 🚀 STEP-BY-STEP: RUN THE APP

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd` and press Enter

**Mac/Linux:**
- Press `Cmd + Space` (Mac) or `Ctrl + Alt + T` (Linux)
- Type `terminal` and press Enter

### Step 2: Navigate to Your Project

If your main project is in your Documents folder:

**Windows:**
```bash
cd Documents\your-project-name\flutter_app
```

**Mac/Linux:**
```bash
cd ~/Documents/your-project-name/flutter_app
```

### Step 3: Verify You're in the Right Place

Run this command to check:
```bash
ls
# or on Windows:
dir
```

You should see these folders/files:
- ✅ `lib/`
- ✅ `android/`
- ✅ `pubspec.yaml`

### Step 4: Get Dependencies

```bash
flutter pub get
```

This downloads all required packages (takes 30-60 seconds).

### Step 5: Connect Your Phone or Start Emulator

**Option A: Physical Phone** (Recommended)
1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect phone via USB
4. Allow USB Debugging when prompted

**Option B: Emulator**
```bash
flutter emulators
flutter emulators --launch <emulator_name>
```

### Step 6: Run the App!

```bash
flutter run
```

The app will build and launch automatically! ✅

---

## 🔍 CAN'T FIND YOUR PROJECT?

### Find it from File Explorer/Finder:

1. **Look for these signs:**
   - Folder contains `flutter_app` subfolder
   - Has files like `package.json`, `README.md`
   - Contains `src` folder (web version)

2. **Common locations:**
   - Windows: `C:\Users\YourName\Documents\`
   - Mac: `/Users/YourName/Documents/`
   - Desktop: Check your Desktop folder

3. **Search by name:**
   - Open File Explorer/Finder
   - Search for "flutter_app"
   - Look for the folder structure above

### Once Found:

Right-click the folder → "Open in Terminal" or "Open Command Prompt here"

Then run:
```bash
cd flutter_app
flutter run
```

---

## 🐛 TROUBLESHOOTING

### "flutter: command not found"

Flutter is not installed. Install it:
- **Website:** https://docs.flutter.dev/get-started/install
- **Choose your OS:** Windows, macOS, or Linux
- **Follow the guide** (takes 15-30 minutes)

After installation, run:
```bash
flutter doctor
```

### "No devices found"

**Fix 1: Connect phone properly**
```bash
adb devices
# Should show your device
```

**Fix 2: Start Android emulator**
```bash
flutter emulators
flutter emulators --launch <emulator_id>
```

### "Build failed"

Clean and rebuild:
```bash
flutter clean
flutter pub get
flutter run
```

### Still stuck?

1. Take a screenshot of your error
2. Check the error message carefully
3. Google the specific error
4. Visit Flutter Discord/StackOverflow

---

## 📱 QUICK COMMANDS CHEAT SHEET

```bash
# Navigate to Flutter app
cd flutter_app

# Get dependencies
flutter pub get

# Check connected devices
flutter devices

# Run app
flutter run

# Run on specific device
flutter run -d <device_id>

# Build APK
flutter build apk --release

# Clean build files
flutter clean

# Check Flutter setup
flutter doctor
```

---

## 🎯 VISUAL GUIDE: FINDING YOUR PROJECT

### Windows File Explorer:
```
This PC
└── Documents (or Desktop)
    └── artisan-bf-project (or similar name)
        └── flutter_app ← YOU NEED TO BE HERE!
            ├── lib/
            ├── android/
            ├── pubspec.yaml
```

### Mac Finder:
```
Macintosh HD
└── Users
    └── YourName
        └── Documents
            └── artisan-bf-project
                └── flutter_app ← YOU NEED TO BE HERE!
```

### Terminal Path Example:
```bash
# Full path might look like:
/Users/YourName/Documents/artisan-bf-project/flutter_app

# Or on Windows:
C:\Users\YourName\Documents\artisan-bf-project\flutter_app
```

---

## ✅ VERIFICATION: AM I IN THE RIGHT FOLDER?

Run this command:
```bash
cat pubspec.yaml
# or on Windows:
type pubspec.yaml
```

**You should see:**
```yaml
name: artisan_bf_app
description: Artisan BF mobile application
...
```

If you see this, you're in the right place! ✅

---

## 🎉 SUCCESS INDICATORS

When `flutter run` succeeds, you'll see:
```
✓ Built build/app/outputs/flutter-apk/app-debug.apk.
Installing build/app/outputs/flutter-apk/app-debug.apk...
Launching lib/main.dart on <device> in debug mode...
Running Gradle task 'assembleDebug'...
✓ Built app successfully
```

Then the app launches on your device! 🎊

---

## 💡 PRO TIPS

1. **Use an IDE:**
   - Install Android Studio or VS Code
   - Open the `flutter_app` folder
   - Click the Run button
   - Much easier than command line!

2. **Hot Reload:**
   - After running `flutter run`
   - Press `r` to reload changes instantly
   - Press `R` for full restart
   - Press `q` to quit

3. **Keep Terminal Open:**
   - Don't close the terminal while app is running
   - You'll see logs and errors here
   - Helps with debugging

---

## 🔗 HELPFUL LINKS

- Flutter Install: https://docs.flutter.dev/get-started/install
- Android Setup: https://docs.flutter.dev/get-started/install/windows#android-setup
- Flutter Doctor: https://docs.flutter.dev/get-started/install/windows#run-flutter-doctor
- VS Code Flutter: https://docs.flutter.dev/development/tools/vs-code

---

## 📞 STILL CAN'T FIND IT?

### Try This:

Open terminal anywhere and run:
```bash
# Windows
dir /s /b pubspec.yaml

# Mac/Linux
find ~ -name "pubspec.yaml" -type f 2>/dev/null | grep flutter_app
```

This searches your entire computer for the Flutter project!

Copy the path it shows, then:
```bash
cd <paste-the-path-here>
flutter run
```

---

**🎯 Quick Start If You Know the Path:**

```bash
cd path/to/your/project/flutter_app
flutter pub get
flutter run
```

Done! ✅
