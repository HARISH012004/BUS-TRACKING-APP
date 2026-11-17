# Free deployment guide for BusTrack

This project is ready for a free deployment flow using:

- Vercel for the web frontend
- Render for the backend API

## 1. Deploy the backend to Render

1. Push the project to GitHub.
2. Open https://render.com
3. Click New > Web Service
4. Connect your GitHub repository
5. Select the `backend` folder as the root directory
6. Use these settings:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
7. Add environment variable:
   - `PORT = 10000`
8. Deploy

After deployment, copy the public Render URL.

## 2. Deploy the frontend to Vercel

1. Push the project to GitHub.
2. Open https://vercel.com
3. Import the repository
4. Set the root directory to `web`
5. Use default Vercel settings
6. Add environment variable:
   - `VITE_API_URL = https://your-render-url` 
7. Deploy

Your teacher can open the Vercel URL on a phone to use the app in the browser.

## 3. Android option

For direct mobile app installation:

1. Open the `android` project in Android Studio
2. Build a signed APK or AAB
3. Upload it to Google Drive or Firebase App Distribution
4. Send the link to the teacher

## Important note

A local URL like `localhost` or `127.0.0.1` does not work from a phone. The app must be deployed to public hosting for a mobile browser link to work.
