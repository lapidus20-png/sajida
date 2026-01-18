# Mobile App Completion Guide

## Overview

This guide shows what has been implemented and what needs to be integrated to make the mobile app feature-complete with the web version.

---

## ✅ COMPLETED FEATURES

### 1. Services Layer (100% Complete)

All backend services are implemented and ready to use:

| Service | File | Status |
|---------|------|--------|
| Storage Service | `lib/services/storage_service.dart` | ✅ Complete |
| Wallet Service | `lib/services/wallet_service.dart` | ✅ Complete |
| Messaging Service | `lib/services/messaging_service.dart` | ✅ Complete |
| Notification Service | `lib/services/notification_service.dart` | ✅ Complete |
| Review Service | `lib/services/review_service.dart` | ✅ Complete |
| Auth Service | `lib/services/auth_service.dart` | ✅ Complete |

### 2. Reusable Widgets (100% Complete)

All UI widgets are ready to integrate:

| Widget | File | Status |
|--------|------|--------|
| File Upload Widget | `lib/widgets/file_upload_widget.dart` | ✅ Complete |
| Wallet Widget | `lib/widgets/wallet_widget.dart` | ✅ Complete |
| Messaging Widget | `lib/widgets/messaging_widget.dart` | ✅ Complete |
| Notification Widget | `lib/widgets/notification_widget.dart` | ✅ Complete |
| Review Widget | `lib/widgets/review_widget.dart` | ✅ Complete |
| Location Picker | `lib/widgets/location_picker_widget.dart` | ✅ Complete |

---

## 🔧 INTEGRATION REQUIRED

### CLIENT DASHBOARD

#### Current Status:
- Basic home screen with categories ✅
- Simple job list ⚠️ Incomplete
- Basic post job form ⚠️ Incomplete

#### What to Add:

**1. Statistics Dashboard**
```dart
// In client_dashboard.dart, add stats cards:
FutureBuilder<Map<String, int>>(
  future: _getClientStats(),
  builder: (context, snapshot) {
    return Row(
      children: [
        _buildStatCard('Total', snapshot.data?['total'] ?? 0, Icons.work),
        _buildStatCard('Actif', snapshot.data?['active'] ?? 0, Icons.pending),
        _buildStatCard('Terminé', snapshot.data?['completed'] ?? 0, Icons.check_circle),
        _buildStatCard('Devis', snapshot.data?['quotes'] ?? 0, Icons.description),
      ],
    );
  },
)

Future<Map<String, int>> _getClientStats() async {
  final jobs = await _supabase
      .from('job_requests')
      .select()
      .eq('client_id', userId);

  return {
    'total': jobs.length,
    'active': jobs.where((j) => j['statut'] == 'publiee').length,
    'completed': jobs.where((j) => j['statut'] == 'terminee').length,
    'quotes': 0, // Calculate from quotes table
  };
}
```

**2. Tabbed Interface**
```dart
// Add TabBar with 5 tabs:
DefaultTabController(
  length: 5,
  child: Column(
    children: [
      TabBar(
        tabs: [
          Tab(text: 'Demandes'),
          Tab(text: 'Devis'),
          Tab(text: 'Documents'),
          Tab(text: 'Stats'),
          Tab(text: 'Avis'),
        ],
      ),
      Expanded(
        child: TabBarView(
          children: [
            MyJobsScreen(userId: userId),
            QuotesTab(userId: userId),
            DocumentsTab(userId: userId),
            StatsTab(userId: userId),
            ReviewsTab(userId: userId),
          ],
        ),
      ),
    ],
  ),
)
```

**3. Integrate File Upload in Post Job Screen**
```dart
// In post_job_screen.dart:
import '../widgets/file_upload_widget.dart';

FileUploadWidget(
  maxFiles: 5,
  uploadType: 'job',
  uploadId: jobId, // After creating job
  onFilesUploaded: (urls) {
    // Save photo URLs to job_photos table
    for (final url in urls) {
      await _supabase.from('job_photos').insert({
        'job_id': jobId,
        'photo_url': url,
      });
    }
  },
)
```

**4. Integrate Location Picker**
```dart
// In post_job_screen.dart:
import '../widgets/location_picker_widget.dart';

ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LocationPickerWidget(
          onLocationSelected: (lat, lng, address) {
            setState(() {
              _latitude = lat;
              _longitude = lng;
              _address = address;
            });
          },
        ),
      ),
    );
  },
  child: Text('Sélectionner l\'emplacement'),
)
```

**5. Add Messaging**
```dart
// Create chat_screen.dart:
import '../widgets/messaging_widget.dart';

class ChatScreen extends StatelessWidget {
  final String currentUserId;
  final String otherUserId;
  final String? jobId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Messages')),
      body: MessagingWidget(
        currentUserId: currentUserId,
        otherUserId: otherUserId,
        jobId: jobId,
      ),
    );
  }
}
```

---

### ARTISAN DASHBOARD

#### Current Status:
- Basic stats cards ⚠️ Placeholder values
- Basic job list ⚠️ Incomplete
- No quote management ❌ Missing
- No portfolio ❌ Missing
- No wallet ❌ Missing

#### What to Add:

**1. Real Statistics**
```dart
// Update artisan_dashboard.dart:
Future<Map<String, dynamic>> _getArtisanStats() async {
  final artisanId = widget.artisanId;

  final quotes = await _supabase
      .from('quotes')
      .select()
      .eq('artisan_id', artisanId);

  final artisan = await _supabase
      .from('artisans')
      .select('note_moyenne, statut_verification')
      .eq('id', artisanId)
      .single();

  return {
    'rating': artisan['note_moyenne'] ?? 0.0,
    'totalQuotes': quotes.length,
    'acceptedQuotes': quotes.where((q) => q['statut'] == 'accepte').length,
    'verification': artisan['statut_verification'],
  };
}
```

**2. Add Wallet Tab**
```dart
// Add to navigation:
import '../widgets/wallet_widget.dart';

Tab(
  child: WalletWidget(userId: userId),
)
```

**3. Unlock Client Details Feature**
```dart
// In job details screen:
import '../services/wallet_service.dart';

final _walletService = WalletService();

ElevatedButton(
  onPressed: () async {
    final budget = job['budget_max'] ?? 0.0;
    final unlockFee = _walletService.calculateUnlockFee(budget);

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Débloquer les coordonnées'),
        content: Text('Coût: $unlockFee FCFA (25% du budget)'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Débloquer'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _walletService.unlockClientDetails(
        userId,
        job['id'],
        budget,
      );

      if (success) {
        final contact = await _walletService.getClientContactInfo(
          userId,
          job['id'],
        );

        // Show contact info
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Coordonnées client'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Téléphone: ${contact?['telephone']}'),
                Text('Email: ${contact?['email']}'),
              ],
            ),
          ),
        );
      }
    }
  },
  child: Text('Débloquer coordonnées (25% du budget)'),
)
```

**4. Portfolio Management**
```dart
// Create portfolio_screen.dart:
import '../widgets/file_upload_widget.dart';
import '../services/storage_service.dart';

class PortfolioScreen extends StatefulWidget {
  final String artisanId;

  @override
  _PortfolioScreenState createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  List<Map<String, dynamic>> _portfolioItems = [];

  @override
  void initState() {
    super.initState();
    _loadPortfolio();
  }

  Future<void> _loadPortfolio() async {
    final items = await _supabase
        .from('portfolio')
        .select()
        .eq('artisan_id', widget.artisanId);

    setState(() {
      _portfolioItems = List<Map<String, dynamic>>.from(items);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Mon Portfolio')),
      body: Column(
        children: [
          FileUploadWidget(
            maxFiles: 10,
            uploadType: 'portfolio',
            uploadId: widget.artisanId,
            onFilesUploaded: (urls) async {
              for (final url in urls) {
                await _supabase.from('portfolio').insert({
                  'artisan_id': widget.artisanId,
                  'photo_url': url,
                });
              }
              _loadPortfolio();
            },
          ),
          Expanded(
            child: GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: _portfolioItems.length,
              itemBuilder: (context, index) {
                final item = _portfolioItems[index];
                return Stack(
                  children: [
                    Image.network(
                      item['photo_url'],
                      fit: BoxFit.cover,
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: IconButton(
                        icon: Icon(Icons.delete, color: Colors.red),
                        onPressed: () async {
                          await _supabase
                              .from('portfolio')
                              .delete()
                              .eq('id', item['id']);
                          _loadPortfolio();
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

**5. Quote Management**
```dart
// Create send_quote_screen.dart:
class SendQuoteScreen extends StatefulWidget {
  final String artisanId;
  final String jobId;

  @override
  _SendQuoteScreenState createState() => _SendQuoteScreenState();
}

class _SendQuoteScreenState extends State<SendQuoteScreen> {
  final _montantController = TextEditingController();
  final _delaiController = TextEditingController();
  final _descriptionController = TextEditingController();

  Future<void> _sendQuote() async {
    await _supabase.from('quotes').insert({
      'job_id': widget.jobId,
      'artisan_id': widget.artisanId,
      'montant': double.parse(_montantController.text),
      'delai_estime': _delaiController.text,
      'description': _descriptionController.text,
      'statut': 'en_attente',
    });

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Devis envoyé avec succès')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Envoyer un devis')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _montantController,
              decoration: InputDecoration(
                labelText: 'Montant (FCFA)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            SizedBox(height: 16),
            TextField(
              controller: _delaiController,
              decoration: InputDecoration(
                labelText: 'Délai estimé',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              decoration: InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _sendQuote,
              child: Text('Envoyer le devis'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### ADMIN DASHBOARD

#### Current Status:
- Basic stats ⚠️ Placeholder
- Stub user management ❌ Not functional
- Stub artisan verification ❌ Not functional

#### What to Add:

**1. User Management**
```dart
// Update lib/screens/admin/manage_users_screen.dart:
class ManageUsersScreen extends StatefulWidget {
  @override
  _ManageUsersScreenState createState() => _ManageUsersScreenState();
}

class _ManageUsersScreenState extends State<ManageUsersScreen> {
  List<Map<String, dynamic>> _users = [];
  String _filterType = 'all';

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    var query = _supabase.from('users').select();

    if (_filterType != 'all') {
      query = query.eq('user_type', _filterType);
    }

    final users = await query;
    setState(() {
      _users = List<Map<String, dynamic>>.from(users);
    });
  }

  Future<void> _deleteUser(String userId) async {
    await _supabase.from('users').delete().eq('id', userId);
    _loadUsers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Gérer les utilisateurs')),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'all', label: Text('Tous')),
                ButtonSegment(value: 'client', label: Text('Clients')),
                ButtonSegment(value: 'artisan', label: Text('Artisans')),
              ],
              selected: {_filterType},
              onSelectionChanged: (Set<String> selected) {
                setState(() {
                  _filterType = selected.first;
                });
                _loadUsers();
              },
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(user['email'][0].toUpperCase()),
                  ),
                  title: Text(user['email']),
                  subtitle: Text('Type: ${user['user_type']}'),
                  trailing: IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text('Confirmer la suppression'),
                          content: Text('Supprimer cet utilisateur?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: Text('Annuler'),
                            ),
                            ElevatedButton(
                              onPressed: () => Navigator.pop(context, true),
                              child: Text('Supprimer'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                              ),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true) {
                        _deleteUser(user['id']);
                      }
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

**2. Artisan Verification**
```dart
// Update lib/screens/admin/manage_artisans_screen.dart:
class ManageArtisansScreen extends StatefulWidget {
  @override
  _ManageArtisansScreenState createState() => _ManageArtisansScreenState();
}

class _ManageArtisansScreenState extends State<ManageArtisansScreen> {
  List<Map<String, dynamic>> _artisans = [];

  @override
  void initState() {
    super.initState();
    _loadArtisans();
  }

  Future<void> _loadArtisans() async {
    final artisans = await _supabase
        .from('artisans')
        .select('*, user:users!user_id(email)')
        .eq('statut_verification', 'en_attente');

    setState(() {
      _artisans = List<Map<String, dynamic>>.from(artisans);
    });
  }

  Future<void> _verifyArtisan(String artisanId, bool approved) async {
    await _supabase.from('artisans').update({
      'statut_verification': approved ? 'verifie' : 'rejete',
    }).eq('id', artisanId);

    _loadArtisans();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Vérifier les artisans')),
      body: ListView.builder(
        itemCount: _artisans.length,
        itemBuilder: (context, index) {
          final artisan = _artisans[index];
          return Card(
            margin: EdgeInsets.all(8),
            child: ExpansionTile(
              leading: CircleAvatar(
                child: Text(artisan['nom'][0].toUpperCase()),
              ),
              title: Text('${artisan['nom']} ${artisan['prenom']}'),
              subtitle: Text(artisan['user']['email']),
              children: [
                Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Métier: ${artisan['metier']}'),
                      Text('Téléphone: ${artisan['telephone']}'),
                      Text('Ville: ${artisan['ville']}'),
                      Text('Expérience: ${artisan['annees_experience']} ans'),
                      SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () => _verifyArtisan(artisan['id'], false),
                            icon: Icon(Icons.close),
                            label: Text('Rejeter'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: () => _verifyArtisan(artisan['id'], true),
                            icon: Icon(Icons.check),
                            label: Text('Approuver'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
```

---

## 🗺️ GOOGLE MAPS SETUP

### Android Configuration

**1. Add API Key to AndroidManifest.xml:**

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <application>
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
  </application>
</manifest>
```

**2. Get API Key:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable Maps SDK for Android
- Enable Maps SDK for iOS
- Create API key
- Restrict key to your app

### iOS Configuration

**1. Add API Key to AppDelegate.swift:**

```swift
// ios/Runner/AppDelegate.swift
import UIKit
import Flutter
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY_HERE")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

---

## 📦 STORAGE BUCKETS SETUP

The following storage buckets must be created in Supabase:

### 1. job-photos
```sql
-- For job request photos
-- Policy: Authenticated users can upload
```

### 2. documents
```sql
-- For client and artisan documents
-- Policy: Owner can upload/view
```

### 3. portfolios
```sql
-- For artisan portfolio images
-- Policy: Artisan can upload, public can view
```

### Create Buckets in Supabase Dashboard:
1. Go to Storage section
2. Click "New bucket"
3. Create each bucket with appropriate policies

---

## 🔧 QUICK INTEGRATION CHECKLIST

### Priority 1: Essential Features (Do First)
- [ ] Integrate file upload in job posting
- [ ] Add wallet widget to artisan dashboard
- [ ] Implement unlock client details feature
- [ ] Add messaging to job details
- [ ] Integrate notifications in main navigation

### Priority 2: Enhanced Features
- [ ] Add portfolio management for artisans
- [ ] Implement quote sending system
- [ ] Add review system for clients
- [ ] Complete admin user management
- [ ] Complete admin artisan verification

### Priority 3: Polish
- [ ] Add real-time listeners for messages
- [ ] Add real-time listeners for notifications
- [ ] Implement distance calculation in job list
- [ ] Add statistics dashboards
- [ ] Add settings screens

---

## 🚀 TESTING & BUILD

### Test on Device
```bash
cd flutter_app

# Connect Android device
flutter devices
flutter run

# Or use emulator
flutter emulators --launch <emulator_id>
flutter run
```

### Build APK
```bash
# Debug APK (for testing)
flutter build apk --debug

# Release APK (for distribution)
flutter build apk --release

# App Bundle (for Play Store)
flutter build appbundle --release
```

### Build iOS (Mac only)
```bash
flutter build ios --release

# Then open in Xcode:
open ios/Runner.xcworkspace
```

---

## 📱 FINAL STEPS FOR APP STORE SUBMISSION

### 1. Update App Identity
```yaml
# pubspec.yaml
name: artisan_bf
version: 1.0.0+1
```

```gradle
// android/app/build.gradle
applicationId "com.artisanbf.app"
versionCode 1
versionName "1.0.0"
```

### 2. Add App Icons
- Generate icons: [appicon.co](https://appicon.co)
- Replace in `android/app/src/main/res/`
- Replace in `ios/Runner/Assets.xcassets/`

### 3. Configure Signing
**Android:**
```gradle
// android/app/build.gradle
signingConfigs {
    release {
        storeFile file('your-keystore.jks')
        storePassword 'your-password'
        keyAlias 'your-key-alias'
        keyPassword 'your-key-password'
    }
}
```

**iOS:**
- Open Xcode
- Select Runner target
- Go to Signing & Capabilities
- Select your team and provisioning profile

---

## 🎯 WHAT'S ALREADY WORKING

| Feature | Status |
|---------|--------|
| Authentication (login/signup) | ✅ Working |
| User profiles | ✅ Working |
| Basic navigation | ✅ Working |
| Database connectivity | ✅ Working |
| Services layer | ✅ Complete |
| Reusable widgets | ✅ Complete |

---

## 📚 NEXT STEPS

1. **Integrate widgets into existing screens** (use code examples above)
2. **Setup Google Maps** (add API key)
3. **Create storage buckets** (in Supabase dashboard)
4. **Test all features** on real device
5. **Build and distribute** (APK/App Bundle)

---

## 💡 TIPS

- Use `hot reload` during development (press 'r' in terminal)
- Use `hot restart` for major changes (press 'R' in terminal)
- Check console for errors with `flutter logs`
- Use Chrome DevTools for debugging: `flutter run -d chrome --web-port=8080`

---

## 🆘 COMMON ISSUES

**Issue: Google Maps not showing**
- Solution: Check API key in AndroidManifest.xml and AppDelegate.swift

**Issue: File upload fails**
- Solution: Ensure storage buckets are created in Supabase

**Issue: Build fails**
- Solution: Run `flutter clean && flutter pub get && flutter build apk`

**Issue: Hot reload not working**
- Solution: Do full restart with `flutter run`

---

## ✅ COMPLETION STATUS

**Mobile App Progress: 70%**

| Category | Progress |
|----------|----------|
| Services | 100% ✅ |
| Widgets | 100% ✅ |
| Client Dashboard | 40% ⚠️ |
| Artisan Dashboard | 40% ⚠️ |
| Admin Dashboard | 30% ⚠️ |
| File Uploads | 100% ✅ (need integration) |
| Wallet/Payments | 100% ✅ (need integration) |
| Messaging | 100% ✅ (need integration) |
| Notifications | 100% ✅ (need integration) |
| Reviews | 100% ✅ (need integration) |
| Maps | 100% ✅ (need API key) |

**Next milestone: 100% by integrating all widgets into screens**

---

This guide provides everything needed to complete the mobile app to match the web version!
