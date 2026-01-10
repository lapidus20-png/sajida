# Google Play Console - App Icon Guide

## 📱 Icon Created

I've created a professional app icon at:
**`public/app-icon.html`**

## 🎨 Icon Design

The icon features:
- **🔧 Gold Wrench** - Represents artisan tools and services
- **🔨 Purple Hammer** - Symbolizes construction and craftsmanship
- **⭐ Central Star Badge** - Excellence and quality ratings
- **🌊 Blue-Teal Gradient Background** - Matches your app branding
- **✨ Decorative Stars** - Burkina Faso theme

## 📏 Google Play Requirements

### High-res Icon (Required)
- **Size:** 512 x 512 pixels
- **Format:** 32-bit PNG with alpha channel
- **Max File Size:** 1024 KB
- **Shape:** Full bleed, no transparent corners for the main background

## 🚀 How to Export Your Icon

### Method 1: Direct Download (Easiest)
1. Open `public/app-icon.html` in your browser
2. Click the blue "Download as PNG (512x512)" button
3. Save the file as `app-icon-512.png`
4. Upload to Google Play Console

### Method 2: Online SVG to PNG Converter
1. Open `public/app-icon.html` in your browser
2. Right-click on the icon
3. Select "Save as..." → Save as `app-icon.svg`
4. Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
5. Upload your SVG
6. Set dimensions: 512 x 512 pixels
7. Convert and download

### Method 3: Screenshot (Quick)
1. Open `public/app-icon.html` in browser
2. Take a screenshot of just the icon (512x512 area)
3. Crop to exact 512x512 pixels using image editor
4. Save as PNG

### Method 4: Professional Tool
1. Open the HTML file
2. Copy the SVG code
3. Import into:
   - **Figma** - Free, web-based
   - **Inkscape** - Free desktop app
   - **Adobe Illustrator** - Professional
4. Export as PNG at 512x512px

## 📤 Uploading to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Store Presence** → **Main Store Listing**
4. Scroll to **App icon**
5. Upload your `app-icon-512.png` file
6. Preview how it looks
7. Save changes

## 📱 Additional Icon Sizes (If Needed)

For Android app development, you might also need these sizes:

| Size | Use Case | Folder |
|------|----------|--------|
| 48x48 | mdpi | res/mipmap-mdpi |
| 72x72 | hdpi | res/mipmap-hdpi |
| 96x96 | xhdpi | res/mipmap-xhdpi |
| 144x144 | xxhdpi | res/mipmap-xxhdpi |
| 192x192 | xxxhdpi | res/mipmap-xxxhdpi |

You can use the same design and export at these sizes from the HTML file or using an online resizer.

## ✅ Checklist Before Upload

- [ ] Icon is exactly 512 x 512 pixels
- [ ] File format is PNG (32-bit)
- [ ] File size is under 1024 KB
- [ ] Icon has no transparent corners on main background
- [ ] Design is clear and recognizable at small sizes
- [ ] Colors match your app branding
- [ ] Icon represents your app's purpose

## 🎯 Design Rationale

### Color Scheme
- **Blue (#2563eb)** - Trust, professionalism
- **Teal (#14b8a6)** - Growth, services
- **Gold (#fbbf24)** - Premium, quality
- **Purple (#7c3aed)** - Creativity, craft

### Symbolism
- **Crossed Tools** - Artisan services and expertise
- **Central Star** - Quality ratings and excellence
- **Gradient Background** - Modern, professional platform
- **Decorative Stars** - Local Burkina Faso cultural element

## 🔄 Need Changes?

To customize the icon:
1. Open `public/app-icon.html` in a code editor
2. Modify the SVG colors, shapes, or gradients
3. Refresh in browser to see changes
4. Re-export when satisfied

### Quick Color Changes:
- **Background gradient:** Look for `#bgGradient` (lines with `stop-color`)
- **Tool colors:** Look for `#toolGradient` and purple fills
- **Accent colors:** Look for `#fbbf24` (gold) and `#2563eb` (blue)

## 📞 Support

If you need help or want design modifications:
1. Open `public/app-icon.html` in your browser
2. Follow the on-screen instructions
3. Use the download button for instant PNG export

## 🌟 Pro Tips

1. **Test at Multiple Sizes:** View your icon at different sizes to ensure it's recognizable
2. **Check on Dark Background:** Google Play may display icons on dark backgrounds
3. **Keep It Simple:** Avoid too much detail - icons are viewed at small sizes
4. **Brand Consistency:** Ensure icon matches your app's UI colors and style
5. **Cultural Relevance:** The Burkina Faso star pattern adds local authenticity

## 📱 Preview Your Icon

Before uploading, preview how it looks:
- On your phone home screen (create a test build)
- In the Play Store search results
- On different background colors (light and dark)
- At different sizes (from 48px to 512px)

Good luck with your app launch! 🚀
