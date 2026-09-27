# Mobile auth email links

The mobile app returns Supabase signup confirmation, password recovery, and
email-change confirmation links to its `auth/callback` route. This uses native
app links rather than the Vercel confirmation/reset pages.

## Supabase URL Configuration

In the Entertainment Power Players Supabase project, open **Authentication →
URL Configuration → Redirect URLs** and add:

```text
com.entertainmentpowerplayers.app://auth/callback
exp://**/--/auth/callback
```

The first URL is used by an installed development/production app. The
wildcard URL supports Expo Go during development, where Expo generates a
device-specific `exp://` URL. The app passes the callback URL explicitly for
each auth operation. If the project has no website, its Site URL may be set to
`com.entertainmentpowerplayers.app://auth/callback` as the mobile fallback.

Google sign-in uses the same Supabase-hosted OAuth browser flow as Star Talks:
the app opens Google's consent screen via Supabase, then exchanges the returned
PKCE code into the app session. Enable Google in **Authentication → Sign In /
Providers → Google** for this project and configure its Google client ID and
secret there. The Google OAuth client's authorized redirect URI must be the
Supabase callback URL shown on that provider settings page; the app deep link
belongs in Supabase's Redirect URLs, not in Google's redirect URI list.

Keep the auth email templates' confirmation link pointed at Supabase's
`{{ .ConfirmationURL }}` so Supabase verifies the one-time token before
redirecting into the app. Do not put an app deep link in Google's OAuth
redirect URIs; this setup is for Supabase email links.

## Flow behavior

- Signup confirmation establishes the Supabase session and resumes onboarding.
- Password recovery establishes the recovery session and opens the in-app
  password form. Saving the new password leaves the user signed into the app.
- Email-change confirmation returns to the app and refreshes the current
  session. If Supabase sends confirmation to both old and new addresses, open
  both links on the same device.

Expo Go links are for development only. Test the stable app scheme in an EAS
development or production build before release.
