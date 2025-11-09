# Auth0 Configuration Checklist

## ✅ Completed Steps

1. ✅ Installed Auth0 Next.js SDK (`@auth0/nextjs-auth0`)
2. ✅ Created `.env.local` with Auth0 credentials
3. ✅ Created `src/lib/auth0.ts` with Auth0Client initialization
4. ✅ Created `middleware.ts` with Auth0 middleware
5. ✅ Wrapped app with `UserProvider` in `src/app/layout.tsx`
6. ✅ Created `LoginButton` component
7. ✅ Created `LogoutButton` component
8. ✅ Created `Profile` component

## 🔧 Required: Auth0 Dashboard Configuration

You MUST configure these settings in your Auth0 Dashboard before authentication will work:

### 1. Navigate to Your Application Settings

Go to: https://manage.auth0.com/dashboard/us/dev-al2djj64ae23ld4i/applications

Select your application: `gPzk9pjUzYmgAxoroRrOu7v1G7KYUZgT`

### 2. Configure Allowed Callback URLs

Add these URLs to the **Allowed Callback URLs** field:

```
http://localhost:3000/auth/callback
```

For production, also add:
```
https://yourdomain.com/auth/callback
```

### 3. Configure Allowed Logout URLs

Add these URLs to the **Allowed Logout URLs** field:

```
http://localhost:3000
```

For production, also add:
```
https://yourdomain.com
```

### 4. Configure Allowed Web Origins (Optional but recommended)

Add these URLs to the **Allowed Web Origins** field:

```
http://localhost:3000
```

### 5. Save Changes

Click **Save Changes** at the bottom of the page.

## 🧪 Testing Auth0 Integration

Once you've configured the Auth0 Dashboard:

1. Start your dev server:
   ```powershell
   npm run dev
   ```

2. Visit: http://localhost:3000

3. Test the login flow:
   - Click the Login button
   - You should be redirected to Auth0 Universal Login
   - Log in with your credentials
   - You should be redirected back to your app

4. Test the profile display:
   - After logging in, you should see your user information

5. Test logout:
   - Click the Logout button
   - You should be logged out and redirected

## 📝 Auto-Configured Routes

The Auth0 SDK automatically provides these routes:

- `/auth/login` - Login page
- `/auth/logout` - Logout endpoint
- `/auth/callback` - OAuth callback (handles redirect from Auth0)
- `/auth/profile` - User profile data (JSON)
- `/auth/access-token` - Get access token

## 🔒 Environment Variables Reference

Your `.env.local` is configured with:

```env
AUTH0_SECRET=0eb463d843860adcc532050433b6eab443f66f6379549d47463b3acde1c29874
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=https://dev-al2djj64ae23ld4i.us.auth0.com
AUTH0_CLIENT_ID=gPzk9pjUzYmgAxoroRrOu7v1G7KYUZgT
AUTH0_CLIENT_SECRET=gPzk9pjUzYmgAxoroRrOu7v1G7KYUZgT
AUTH0_AUDIENCE=
AUTH0_SCOPE=openid profile email
```

**Note:** `AUTH0_AUDIENCE` is empty because you don't have a custom API configured yet. This is fine for basic authentication.

## ✅ Tasks Completed

- [x] T015 - Install @auth0/nextjs-auth0@latest SDK
- [x] T016 - Create Auth0 client configuration in lib/auth0.ts
- [x] T017 - Create middleware.ts with Auth0 middleware
- [x] T018 - Wrap app with UserProvider in layout.tsx
- [x] T019 - Create LoginButton component
- [x] T020 - Create LogoutButton component
- [x] T021 - Create Profile component

## 🚀 Next Steps

After configuring Auth0 Dashboard and testing:

1. Continue with tRPC API Setup (T022-T026)
2. Implement Finance Engine Library (T027-T032)
3. Implement Ranking Engine Library (T033-T038)
