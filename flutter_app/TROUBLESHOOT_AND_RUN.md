# 🔧 TROUBLESHOOTING GUIDE: Flutter App Not Running

## ⚠️ FIXED: Missing Assets Folder
**Issue Found:** The assets folder was missing, which prevented the app from building.
**Status:** ✅ FIXED - Assets folders have been created.

---

## 🚀 STEP-BY-STEP: RUN THE APP NOW

### **Step 1: Clean and Get Dependencies**

Open your terminal in the `flutter_app` folder and run:

```bash
flutter clean
flutter pub get
```

This clears old build files and downloads all packages fresh.

---

### **Step 2: Check Your Device Connection**

Run this command to see connected devices:

```bash
flutter devices
```

**Expected output:**
```
Found 2 devices:
  SM G991B (mobile) • 123ABC456 • android-arm64 • Android 13 (API 33)
  Chrome (web)      • chrome    • web-javascript • Google Chrome 120.0
```

**If you see your phone listed:** ✅ Great! Proceed to Step 3.

**If you DON'T see your phone:**

#### Fix 1: Enable USB Debugging
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (enables Developer Mode)
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Reconnect your phone
6. Accept the USB debugging prompt on your phone

#### Fix 2: Check USB Connection
- Try a different USB cable
- Try a different USB port
- Make sure you selected "File Transfer" or "MTP" mode on your phone

#### Fix 3: Restart ADB
```bash
adb kill-server
adb start-server
adb devices
```

You should see your device listed now.

---

### **Step 3: Run the App**

```bash
flutter run
```

**What will happen:**
1. Gradle will build the app (first time takes 3-5 minutes)
2. The app will be installed on your phone
3. The app will launch automatically
4. You'll see the login/signup screen

---

## 🐛 COMMON ERRORS & FIXES

### Error: "No connected devices"

**Solution:**
```bash
# Check USB debugging is enabled
adb devices

# Should show:
# List of devices attached
# 123ABC456    device
```

If it shows "unauthorized", accept the prompt on your phone.

---

### Error: "Gradle build failed"

**Solution 1: Update Gradle**
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

**Solution 2: Check Java Version**
```bash
java -version
# Should show Java 11 or higher
```

---

### Error: "Assets not found"

**Solution:** This was the issue! Already fixed. Run:
```bash
flutter clean
flutter pub get
flutter run
```

---

### Error: "Execution failed for task ':app:minifyReleaseWithR8'"

**Solution:** Run in debug mode (default):
```bash
flutter run
```

Don't use `--release` flag when testing.

---

### Error: "Could not resolve com.google.android.gms:play-services-maps"

**Solution:** Check internet connection, then:
```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
cd ..
flutter pub get
flutter run
```

---

### App installs but crashes immediately

**Solution 1: Check logs**
```bash
flutter run -v
```

Look for errors in red. Common issues:
- Supabase connection error
- Google Maps API key issue
- Missing permissions

**Solution 2: Check permissions**
Make sure you granted:
- Location permission
- Camera permission
- Storage permission

Grant these when the app asks, or go to:
**Settings** → **Apps** → **Artisan BF** → **Permissions**

---

### App shows blank white screen

**Possible causes:**
1. **Supabase connection issue:** Check internet connection
2. **Google Maps not loading:** Maps API key might be invalid
3. **React too slow:** Wait 10-20 seconds for first load

**Solution:**
```bash
# Run with verbose logging
flutter run -v

# Watch for errors in the output
```

---

### Hot Reload not working

**Solution:**
After running `flutter run`, press:
- `r` - Hot reload (reloads code changes)
- `R` - Hot restart (full app restart)
- `q` - Quit

If changes don't appear, use `R` (capital R) for full restart.

---

## 📱 VERIFY APP IS WORKING

When the app launches successfully, you should see:

1. **Login Screen** with:
   - Email and password fields
   - "Connexion" button
   - "Créer un compte" link

2. You can:
   - Create a new account
   - Login if you have an account
   - Access the dashboard after login

---

## 🔍 DEBUGGING COMMANDS

### Check what's running:
```bash
flutter devices              # List connected devices
adb devices                  # List Android devices specifically
flutter doctor               # Check Flutter setup
flutter doctor -v            # Detailed Flutter setup info
```

### Clean and rebuild:
```bash
flutter clean                # Remove build files
flutter pub get              # Get dependencies
flutter pub upgrade          # Upgrade packages
flutter run --verbose        # Run with detailed logs
```

### Check specific device:
```bash
flutter run -d <device_id>   # Run on specific device
flutter run -d all           # Run on all connected devices
```

### Android specific:
```bash
cd android
./gradlew clean              # Clean Android build
./gradlew tasks              # List all Gradle tasks
cd ..
```

---

## 📊 PERFORMANCE TIPS

### First build is slow (3-5 minutes):
This is normal! Gradle needs to:
- Download dependencies
- Build the Android app
- Compile Dart code
- Install on device

### Subsequent builds are faster (30-60 seconds):
Flutter caches everything for faster rebuilds.

### Use Hot Reload:
After first run, press `r` to reload changes instantly without rebuilding!

---

## ✅ FINAL CHECKLIST

Before running, make sure:

- [ ] You're in the `flutter_app` folder
- [ ] You ran `flutter pub get`
- [ ] Your phone is connected via USB
- [ ] USB debugging is enabled
- [ ] Your phone appears in `flutter devices`
- [ ] You have internet connection (for first build)
- [ ] Assets folder exists (✅ Already fixed!)

Then run:
```bash
flutter run
```

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Navigate to flutter_app
cd path/to/project/flutter_app

# Clean everything
flutter clean

# Get dependencies
flutter pub get

# Check devices
flutter devices

# Run app
flutter run

# Run with logs
flutter run -v

# Stop app
# Press 'q' in terminal or Ctrl+C
```

---

## 🆘 STILL NOT WORKING?

### **Get detailed error information:**

1. Run with verbose logging:
```bash
flutter run -v > flutter_log.txt 2>&1
```

2. Check the log file:
```bash
cat flutter_log.txt
# or on Windows:
type flutter_log.txt
```

3. Look for lines with:
   - `ERROR`
   - `EXCEPTION`
   - `FATAL`
   - `Failed to`

### **Share specific error messages:**

Copy the error output and I can help you fix the specific issue!

Common patterns:
- "Could not resolve..." → Dependency issue
- "No devices found" → Device connection issue
- "Execution failed" → Build configuration issue
- "Exception: ..." → Code/runtime issue

---

## 📞 SUPPORT RESOURCES

- Flutter Documentation: https://docs.flutter.dev
- Flutter Issues: https://github.com/flutter/flutter/issues
- Stack Overflow: https://stackoverflow.com/questions/tagged/flutter
- Flutter Community: https://flutter.dev/community

---

## ✨ SUCCESS INDICATORS

When everything works, you'll see:

```
Launching lib/main.dart on SM G991B in debug mode...
Running Gradle task 'assembleDebug'...
✓ Built build/app/outputs/flutter-apk/app-debug.apk in 32.1s
Installing build/app/outputs/flutter-apk/app.apk...
Waiting for SM G991B to report its views...
Debug service listening on ws://127.0.0.1:12345/abc123/
Synced 0.0MB
```

And the app will launch on your phone! 🎉

---

**Last Updated:** January 2026
**Status:** Assets issue fixed ✅ - Ready to run!
