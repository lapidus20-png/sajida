# Enable Phone Authentication & SMS OTP

## Step 1: Configure Supabase Dashboard

### Enable Phone Provider

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Phone** in the list of providers
5. Toggle it to **Enabled**

### Configure SMS Provider

You have several SMS provider options:

#### Option A: Twilio (Recommended)
1. Create a Twilio account at https://www.twilio.com
2. Get your:
   - Account SID
   - Auth Token
   - Phone Number (with SMS capabilities)
3. In Supabase Dashboard > Authentication > Providers > Phone:
   - Select **Twilio** as provider
   - Enter your **Twilio Account SID**
   - Enter your **Twilio Auth Token**
   - Enter your **Twilio Phone Number**

#### Option B: MessageBird
1. Create a MessageBird account
2. Get your API key
3. Configure in Supabase Dashboard

#### Option C: Vonage (Nexmo)
1. Create a Vonage account
2. Get your API credentials
3. Configure in Supabase Dashboard

#### Option D: Supabase Test Mode (Development Only)
- For testing, you can use Supabase's built-in phone confirmation
- Phone OTPs will appear in the Supabase logs
- **DO NOT use in production**

### Configure OTP Settings

In Authentication > Providers > Phone settings:

- **OTP Expiry**: 60 seconds (default) - adjust as needed
- **OTP Length**: 6 digits (default)
- **Phone Verification Required**: Toggle ON
- **Auto-confirm Phone**: Toggle OFF (for production)

## Step 2: Code Implementation

The phone authentication functionality needs to be added to your frontend code.

### Frontend Changes Required

Your authentication code needs to support:
1. Phone number input
2. OTP verification
3. Sign in with phone

### Example Usage

```typescript
// Sign up with phone
const { data, error } = await supabase.auth.signUp({
  phone: '+1234567890',
  password: 'your-password'
})

// Sign in with OTP
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+1234567890'
})

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+1234567890',
  token: '123456',
  type: 'sms'
})
```

## Step 3: Update Environment Variables

Add to your `.env` file (if using custom SMS webhook):

```
VITE_SUPABASE_PHONE_ENABLED=true
```

## Step 4: Test Configuration

1. Use a real phone number (or test number from your SMS provider)
2. Request OTP via your app
3. Check SMS delivery
4. Verify OTP works
5. Confirm user is created in auth.users

## Security Notes

- Always use SSL/HTTPS in production
- Rate limit OTP requests to prevent abuse
- Implement phone number validation
- Store phone numbers in E.164 format (+country_code + number)
- Never expose SMS provider credentials in client code
- Use Supabase's built-in rate limiting

## Costs

- Twilio: ~$0.0075 per SMS (varies by country)
- MessageBird: ~$0.05 per SMS (varies by country)
- Vonage: ~$0.0068 per SMS (varies by country)

## Troubleshooting

### OTP Not Received
- Check SMS provider credentials
- Verify phone number format (E.164)
- Check SMS provider balance
- Review Supabase logs for errors

### Invalid OTP
- Check OTP expiry time
- Ensure correct phone number
- Verify OTP hasn't been used already

### Rate Limiting
- Supabase has built-in rate limits
- Default: 4 OTP requests per hour per phone
- Adjust in Authentication settings if needed

## Next Steps

After enabling in dashboard:
1. Update your AuthPage component to include phone authentication
2. Add phone number input field
3. Add OTP verification UI
4. Test with real phone numbers
5. Deploy to production

Would you like me to update the frontend code to support phone authentication?
