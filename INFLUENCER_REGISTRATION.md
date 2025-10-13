# 📧 Influencer Registration Flow

## Overview

This platform now features a complete influencer onboarding system where admins can invite influencers via email. The invited influencers go through a consent-based registration process and can connect their Instagram accounts to automatically import their profile data.

## 🌟 Features

### For Admins
- **Email Invitations**: Send invitation emails to influencers
- **Invite Management**: Track all sent invitations (pending, completed, expired)
- **Dashboard**: View statistics on invitation status
- **Automatic Profile Creation**: Influencer profiles are automatically created when they complete registration

### For Influencers
- **Email Invitation**: Receive a personalized invitation email with a unique registration link
- **Consent Form**: Review and accept terms and data usage policies
- **Instagram Integration**: Connect Instagram account to auto-import profile data
- **Data Privacy**: Full transparency on what data is collected and how it's used

## 🔄 Registration Flow

### Step 1: Admin Sends Invitation
1. Admin logs into the platform
2. Navigates to **📧 Invites** page
3. Clicks **"+ Send New Invite"**
4. Enters influencer's email address
5. System sends invitation email with unique token
6. Token is valid for 7 days

### Step 2: Influencer Receives Email
The influencer receives an email containing:
- Welcome message
- Registration link (with unique token)
- Link expiration information

### Step 3: Consent & Terms
When the influencer clicks the link:
1. Token is verified
2. Influencer sees a consent form explaining:
   - Instagram data access permissions
   - How their data will be used
   - Privacy policy
   - Right to revoke access
3. Must accept terms to continue

### Step 4: Instagram Connection (Optional)
After accepting terms:
1. Option to connect Instagram account
2. Redirected to Instagram OAuth
3. Grants permissions for profile data access
4. Returns to platform with access token
5. Profile data is automatically imported:
   - Username
   - Follower count
   - Profile picture
   - Bio
   - Media count

### Step 5: Registration Complete
- KOL profile is created in the database
- Influencer sees confirmation screen
- Can now be matched with campaign opportunities

## 🔧 Technical Setup

### Backend Requirements

1. **Database Migration**
   ```bash
   cd backend
   source venv/bin/activate
   flask db migrate -m "Add influencer invite and Instagram integration"
   flask db upgrade
   ```

2. **Environment Variables**
   
   Copy `.env.example` to `.env` and configure:

   ```bash
   # Email Configuration (Required for sending invites)
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_DEFAULT_SENDER=noreply@kolplatform.com

   # Instagram API (Optional - for Instagram integration)
   INSTAGRAM_APP_ID=your-instagram-app-id
   INSTAGRAM_APP_SECRET=your-instagram-app-secret
   INSTAGRAM_REDIRECT_URI=http://localhost:3000/influencer/instagram-callback
   ```

3. **Install Dependencies**
   ```bash
   pip install Flask-Mail==0.9.1 requests==2.31.0 itsdangerous==2.1.2
   ```

### Email Setup (Gmail Example)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security
3. Enable 2-Step Verification
4. Create an App Password:
   - Select "Mail" as the app
   - Select your device
   - Copy the generated password
5. Use this password in `MAIL_PASSWORD`

### Instagram API Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Instagram Basic Display product
4. Configure OAuth Redirect URLs:
   - Add: `http://localhost:3000/influencer/instagram-callback`
   - For production: `https://yourdomain.com/influencer/instagram-callback`
5. Copy App ID and App Secret to `.env`

**Note**: Instagram API requires app review for production use. For testing, you can add test users.

## 📱 Frontend Routes

- **`/invites`**: Admin dashboard for managing invitations (admin only)
- **`/influencer/register?token=XXX`**: Public registration page for influencers
- **`/influencer/instagram-callback`**: OAuth callback handler

## 🔒 Security Features

- **Token Expiration**: Registration links expire after 7 days
- **One-time Use**: Tokens can only be used once
- **Secure Storage**: Instagram access tokens are stored securely in database
- **Consent Required**: Explicit consent required before any data access
- **Role-based Access**: Only admins can send invitations

## 📊 Database Models

### InfluencerInvite
```python
- email: Email address of invitee
- token: Unique registration token
- invited_by: User ID of admin who sent invite
- status: pending | completed | expired
- expires_at: Token expiration date
- used_at: When registration was completed
- kol_id: Associated KOL profile (after registration)
```

### KOL (Extended)
```python
# New Instagram fields
- instagram_id: Instagram user ID
- instagram_username: Instagram username
- instagram_access_token: OAuth access token
- instagram_token_expires_at: Token expiration date

# New consent fields
- consent_given: Boolean flag
- consent_given_at: Timestamp of consent
- registration_completed: Boolean flag
```

## 🎯 Testing the Flow

### Without Email (Development)

If you don't have email credentials configured:

1. Send an invite from admin dashboard
2. Check backend logs for the registration link
3. Copy the token from logs
4. Manually navigate to: `http://localhost:3000/influencer/register?token=YOUR_TOKEN`

### Without Instagram API

The flow works without Instagram integration:

1. Influencer can skip Instagram connection
2. Profile is still created with email
3. Admin can manually add Instagram data later

## 🔍 API Endpoints

### Admin Endpoints (Requires JWT + Admin Role)

- **POST /api/invites** - Send new invitation
- **GET /api/invites** - List all invitations

### Public Endpoints

- **GET /api/invites/verify/:token** - Verify token validity
- **POST /api/invites/complete** - Complete registration
- **GET /api/instagram/auth-url** - Get Instagram OAuth URL
- **POST /api/instagram/exchange-token** - Exchange OAuth code for token

## 📧 Email Template

The invitation email includes:
- Welcoming header with platform branding
- Clear call-to-action button
- Registration link (for email clients that don't support buttons)
- Expiration notice
- Privacy reassurance

## 🚀 Future Enhancements

Potential improvements:
- SMS invitations
- Batch invite upload (CSV)
- Custom invitation messages
- Reminder emails for pending invites
- TikTok/YouTube OAuth integration
- Multi-platform account linking
- Influencer dashboard/portal
- Campaign acceptance workflow
- Payment integration

## 🐛 Troubleshooting

### Email Not Sending
- Check MAIL_USERNAME and MAIL_PASSWORD in `.env`
- Verify Gmail App Password is correct
- Check firewall settings for SMTP port 587
- Review backend logs for error messages

### Instagram Connection Fails
- Verify INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET
- Check redirect URI matches exactly (including http/https)
- Ensure app is in development mode with test users added
- Check browser console for CORS errors

### Token Invalid/Expired
- Tokens expire after 7 days
- Each token can only be used once
- Admin can send a new invite if needed

## 📝 Admin Guide

### Sending an Invite

1. Log in as admin
2. Click **📧 Invites** in navigation
3. Click **+ Send New Invite**
4. Enter influencer's email
5. Click **Send Invitation**
6. Invite appears in dashboard with "pending" status
7. Once influencer completes registration, status changes to "completed"

### Managing Invites

The invites dashboard shows:
- **Total Invites**: All invitations ever sent
- **Pending**: Awaiting influencer registration
- **Completed**: Successfully registered
- **Expired**: Past 7-day expiration

### Checking Registration Status

Each invite shows:
- Email address
- Current status
- When it was sent
- When it expires
- When it was used (if completed)

## 🎓 Influencer Guide

### Completing Registration

1. Check your email for invitation
2. Click the registration link
3. Read and accept the terms
4. (Optional) Connect your Instagram account
5. View confirmation screen
6. Wait for campaign opportunities!

### What Data is Collected

When you connect Instagram:
- Username
- Follower count
- Profile picture
- Bio/description
- Media count

This data helps brands:
- Find influencers that match their target audience
- Evaluate reach and engagement
- Make informed collaboration decisions

### Your Rights

You can:
- Revoke access at any time
- Request data deletion
- Update your profile
- Decline campaign offers

## 🎉 Success Metrics

Track the effectiveness of your influencer program:
- Invite acceptance rate
- Time to complete registration
- Instagram connection rate
- Campaign match success
- Influencer satisfaction

