# ⚡ QUICK START - RUN APP NOW

## ✅ ISSUE FIXED!

**Problem Found:** The assets folder was missing.
**Status:** FIXED - You can now run the app!

---

## 🚀 RUN IN 3 COMMANDS

Open terminal in the `flutter_app` folder and run:

```bash
flutter clean
flutter pub get
flutter run
```

That's it! The app will build and launch on your phone.

---

## 🎯 OR USE THE AUTOMATIC SCRIPT

### Windows:
Double-click: **RUN_ON_DEVICE.bat**

### Mac/Linux:
```bash
./RUN_ON_DEVICE.sh
```

---

## ⚠️ IF IT STILL DOESN'T WORK

### Problem: "No devices found"

**Solution:**
1. Enable USB Debugging on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back → Developer Options
   - Enable "USB Debugging"

2. Reconnect your phone via USB

3. Accept the USB debugging prompt on your phone

4. Run again:
```bash
flutter run
```

---

### Problem: App installs but crashes

**Solution:**
Grant permissions when the app asks:
- Location permission (required for maps)
- Camera permission (for photo upload)
- Storage permission (for files)

Or manually grant in:
**Settings → Apps → Artisan BF → Permissions**

---

### Problem: Gradle build fails

**Solution:**
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

---

## 📱 WHAT TO EXPECT

**First run:** Takes 3-5 minutes (Gradle needs to build everything)

**After building:**
- App installs on your phone automatically
- App launches automatically
- You see the login/signup screen

**Next runs:** Much faster (30-60 seconds)

---

## 🔥 HOT RELOAD

After the app is running, you can make code changes and press:
- `r` - Quick reload
- `R` - Full restart
- `q` - Quit

Changes appear instantly!

---

## ✨ SUCCESS!

When it works, you'll see:
```
✓ Built build/app/outputs/flutter-apk/app-debug.apk
Installing build/app/outputs/flutter-apk/app.apk...
```

And the app launches on your phone! 🎉

---

## 🆘 NEED MORE HELP?

Read: **TROUBLESHOOT_AND_RUN.md** for detailed solutions to all common errors.

---

**TL;DR:** Run `flutter clean && flutter pub get && flutter run` and it should work now!
