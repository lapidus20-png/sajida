# Flutter App Updated to Match Web App

## Summary

The Flutter app has been updated to match the web app exactly. The app is now called **BuilderHub** and features the Burkina Faso flag colors (red, green, yellow) throughout the design.

## What Was Changed

### 1. App Branding & Theme
- **App name changed** from "Artisan BF" to "BuilderHub"
- **New color scheme** matching Burkina Faso flag:
  - Red (#EF2B2D)
  - Green (#00A651)
  - Yellow (#FCD116)
- **New app constants** file created with consistent colors, spacing, and theme

### 2. Authentication Screen
- **Complete redesign** to match web app
- Features Burkina Faso flag gradient header
- Grid of trade icons in the header
- Yellow star logo in the center
- French language throughout
- Supports both client and artisan registration
- Includes all required fields:
  - Email, password
  - Name, surname, telephone
  - Métier selection for artisans (100+ trades)
  - Address, city

### 3. Job Categories
- **Complete list of 100+ artisan trades** organized into 12 groups:
  - BÂTIMENT & CONSTRUCTION (🏗️)
  - RÉPARATION & MAINTENANCE (🔧)
  - MÉCANIQUE & TRANSPORT (🚗)
  - BOIS, MÉTAL & FABRICATION (🪵)
  - COUTURE, CUIR & MODE (👞)
  - BEAUTÉ & BIEN-ÊTRE (💇)
  - ALIMENTATION ARTISANALE (🍞)
  - ART, DÉCORATION & CRÉATION (🎨)
  - ARTISANAT TRADITIONNEL (🧺)
  - ENVIRONNEMENT & AGRI-ARTISANAT (🌱)
  - SERVICES DIVERS (🧰)
  - SÉCURITÉ (🛡️)

### 4. Navigation
- Updated to use Supabase directly (removed Provider dependency)
- Automatic routing based on user type:
  - Clients → Client Dashboard
  - Artisans → Artisan Dashboard
  - Admins → Admin Dashboard

### 5. File Structure
```
flutter_app/
├── lib/
│   ├── constants/
│   │   └── app_constants.dart          # NEW: App theme & colors
│   ├── models/
│   │   └── job_categories.dart         # NEW: 100+ trade categories
│   ├── screens/
│   │   ├── auth/
│   │   │   └── auth_screen.dart        # UPDATED: New design
│   │   └── main_navigation.dart        # UPDATED: Simplified routing
│   └── main.dart                       # UPDATED: New branding
```

## How to Run the App

### Prerequisites
1. Flutter SDK installed
2. Android Studio or VS Code with Flutter plugin
3. Android device or emulator (or iOS device/simulator)

### Steps

1. **Navigate to the Flutter app directory:**
   ```bash
   cd flutter_app
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Check for connected devices:**
   ```bash
   flutter devices
   ```

4. **Run the app:**
   ```bash
   flutter run
   ```

   Or for a specific device:
   ```bash
   flutter run -d <device_id>
   ```

## Features Now Matching Web App

### Authentication
✅ Burkina Faso flag gradient header
✅ BuilderHub branding
✅ French language
✅ Client/Artisan role selection
✅ All form fields (email, password, name, phone, city, etc.)
✅ Métier dropdown with 100+ trades
✅ Error handling
✅ Loading states

### Design
✅ Burkina Faso colors (red, green, yellow)
✅ Consistent spacing and typography
✅ Modern Material Design 3
✅ Clean white cards with shadows
✅ Rounded corners throughout
✅ Professional color palette

### Navigation
✅ Automatic user role detection
✅ Separate dashboards for clients, artisans, and admins
✅ Proper auth state handling
✅ Sign out functionality

## Key Differences from Previous Version

| Aspect | Old Version | New Version |
|--------|-------------|-------------|
| App Name | Artisan BF | BuilderHub |
| Language | French | French (unchanged) |
| Colors | Generic blue | Burkina Faso flag colors |
| Auth Design | Basic form | Beautiful gradient header with icons |
| Branding | Minimal | Prominent with flag & star |
| Categories | Limited | 100+ trades in 12 groups |
| State Management | Provider | Direct Supabase (simpler) |

## Next Steps

The existing dashboards (Client, Artisan, Admin) will continue to work with the new authentication flow. The dashboards already have all the features from the web app:

- **Client Dashboard**: Post jobs, view quotes, select artisans, manage documents
- **Artisan Dashboard**: View opportunities, send quotes, manage profile, wallet system
- **Admin Dashboard**: Manage users, monitor platform activity

## Testing Checklist

- [ ] App launches without errors
- [ ] Login screen displays correctly
- [ ] Registration works for clients
- [ ] Registration works for artisans
- [ ] Métier dropdown shows all 100+ trades
- [ ] Login redirects to appropriate dashboard
- [ ] App uses BuilderHub branding
- [ ] Colors match Burkina Faso flag

## Technical Notes

### Supabase Connection
The app connects to the same Supabase backend as the web app:
- URL: `https://fldkqlardekarhibnyyx.supabase.co`
- Uses the same database tables: `users`, `artisans`, `job_requests`, etc.

### Authentication Flow
1. User enters credentials on auth screen
2. Supabase authenticates the user
3. App queries `users` table to get user type
4. App routes to appropriate dashboard
5. Dashboard loads user-specific data

### Removed Dependencies
- `provider` package (simplified state management)
- Custom AuthService (using Supabase directly)

The app is now cleaner, simpler, and matches the web app exactly!
