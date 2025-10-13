# 🚀 Quick Start: Influencer Registration Feature

## For Admins

### Step 1: Login as Admin
```
Email: admin@example.com
Password: admin123
```

### Step 2: Send an Invite

1. Click **📧 Invites** in the navigation bar
2. Click **+ Send New Invite** button
3. Enter the influencer's email address
4. Click **Send Invitation**

### Step 3: Share the Link

If email is not configured, you'll see a message that the invite was created but email failed. You can:
- Copy the registration link from the backend logs
- Or check the browser network tab for the token in the API response
- Manually share: `http://localhost:3000/influencer/register?token=THE_TOKEN`

## For Testing (Without Email Setup)

### Method 1: Get Token from Response

1. Open browser DevTools (F12)
2. Go to Network tab
3. Send an invite from admin dashboard
4. Find the POST request to `/api/invites`
5. Check the response - it contains the invite details including the token
6. Open: `http://localhost:3000/influencer/register?token=PASTE_TOKEN_HERE`

### Method 2: Check Database

```bash
cd backend
source venv/bin/activate
python
```

```python
from app import app, db
from models import InfluencerInvite

with app.app_context():
    # Get latest invite
    invite = InfluencerInvite.query.order_by(InfluencerInvite.created_at.desc()).first()
    print(f"Email: {invite.email}")
    print(f"Token: {invite.token}")
    print(f"Registration Link: http://localhost:3000/influencer/register?token={invite.token}")
```

## Testing the Registration Flow

### 1. Access Registration Page
Navigate to: `http://localhost:3000/influencer/register?token=YOUR_TOKEN`

### 2. Accept Consent
- Read the terms and data usage policy
- Check the consent checkbox
- Click **Accept & Continue →**

### 3. Instagram Connection (Optional)

**Without Instagram API Setup:**
- Click **Skip for Now**
- Profile will be created without Instagram data

**With Instagram API Setup:**
- Click **Connect Instagram**
- Log into your Instagram account
- Grant permissions
- Return to platform

### 4. Completion
- See success message
- Profile is now created in the KOL database
- Can be seen by logging in as admin and going to KOLs page

## Verifying It Works

### Check Invite Status

1. Log in as admin
2. Go to **📧 Invites** page
3. Find your invite in the table
4. Status should change from **pending** to **completed**
5. **Used At** column should show completion timestamp

### Check KOL Profile

1. As admin, go to **KOLs** page
2. Find the newly created influencer profile
3. Check that:
   - Email matches the invited email
   - Instagram data is populated (if connected)
   - Consent fields are set to true
   - Registration completed flag is true

## Testing Without Email Configuration

You can test the entire flow without configuring email:

1. Leave `MAIL_USERNAME` and `MAIL_PASSWORD` empty in `.env`
2. Send invite from admin dashboard
3. Backend will create the invite but email sending will fail
4. Extract the token from:
   - Browser DevTools Network tab
   - Backend database
   - Backend logs (if logging is enabled)
5. Manually construct the registration URL
6. Complete the registration flow

## Testing Without Instagram API

You can test without Instagram integration:

1. Leave `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` empty in `.env`
2. Complete registration flow
3. Click **Skip for Now** on Instagram connection step
4. Profile will be created with email only
5. Instagram fields will be null in database

## Demo Video Script

### Admin Perspective (1-2 minutes)

1. **Login**: Show admin login
2. **Navigate**: Click on Invites in navbar
3. **Dashboard**: Show empty invites dashboard
4. **Send Invite**: Click "Send New Invite" button
5. **Enter Email**: Type influencer email
6. **Submit**: Show success message
7. **View Status**: Show invite appears as "pending"

### Influencer Perspective (2-3 minutes)

1. **Email**: Show invitation email (if configured)
2. **Click Link**: Open registration page
3. **Verify Token**: Show loading then consent form
4. **Read Terms**: Scroll through consent form
5. **Accept**: Check consent box and click Continue
6. **Instagram Option**: Show Instagram connection page
7. **Skip or Connect**: Demonstrate either path
8. **Success**: Show completion screen

### Verification (1 minute)

1. **Admin Login**: Back to admin account
2. **Check Invites**: Show status changed to "completed"
3. **View KOLs**: Navigate to KOLs page
4. **Find Profile**: Show newly created influencer profile
5. **Check Data**: Show populated fields

## Common Issues & Solutions

### Issue: "Invalid or expired token"

**Solution:**
- Token expires after 7 days
- Token can only be used once
- Send a new invite if needed

### Issue: Email not received

**Solutions:**
- Check spam/junk folder
- Verify MAIL_USERNAME and MAIL_PASSWORD in `.env`
- Check backend logs for errors
- Use manual token extraction method for testing

### Issue: Instagram connection fails

**Solutions:**
- Verify Instagram API credentials in `.env`
- Check redirect URI matches exactly
- Ensure Instagram app is in correct mode
- Use "Skip for Now" to test without Instagram

### Issue: Registration completes but profile not found

**Solutions:**
- Check database for KOL entry
- Verify no errors in backend logs
- Check that invite status is "completed"
- Ensure database migration was applied

## Next Steps

After successful registration:

1. **For Admin:**
   - View influencer profile in KOLs page
   - Create campaigns to match with influencers
   - Edit/update influencer details if needed

2. **For Influencer:**
   - Wait for campaign opportunities
   - Admin can contact via email
   - Profile visible to potential brand partners

3. **For Development:**
   - Set up real email credentials
   - Configure Instagram API
   - Test with multiple influencers
   - Implement reminder emails
   - Add influencer portal/dashboard

## Production Checklist

Before deploying to production:

- [ ] Configure real email credentials (not Gmail App Password for production)
- [ ] Set up Instagram API app and complete app review
- [ ] Update `FRONTEND_URL` in `.env` to production domain
- [ ] Update Instagram redirect URI to production URL
- [ ] Change `SECRET_KEY` and `JWT_SECRET_KEY` to secure random values
- [ ] Test email deliverability
- [ ] Test Instagram OAuth flow
- [ ] Set up monitoring for failed invites
- [ ] Add rate limiting for invite sending
- [ ] Implement email templates with your branding
- [ ] Add analytics tracking

## API Testing with cURL

### Send Invite (Admin JWT required)

```bash
curl -X POST http://localhost:5001/api/invites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{"email": "influencer@example.com"}'
```

### Verify Token

```bash
curl http://localhost:5001/api/invites/verify/YOUR_TOKEN
```

### Complete Registration

```bash
curl -X POST http://localhost:5001/api/invites/complete \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "consent_given": true,
    "instagram_data": null
  }'
```

## Database Queries

### View All Invites

```sql
SELECT email, status, created_at, expires_at, used_at 
FROM influencer_invites 
ORDER BY created_at DESC;
```

### View KOLs with Instagram Data

```sql
SELECT name, email, instagram_username, followers, consent_given 
FROM kols 
WHERE instagram_id IS NOT NULL;
```

### Check Expired Invites

```sql
SELECT email, created_at, expires_at 
FROM influencer_invites 
WHERE status = 'pending' AND expires_at < NOW();
```

## Support

For issues or questions:
- Check `INFLUENCER_REGISTRATION.md` for detailed documentation
- Review backend logs: `backend/logs/` (if logging configured)
- Check browser console for frontend errors
- Inspect database tables for data integrity
- Verify environment variables are set correctly

