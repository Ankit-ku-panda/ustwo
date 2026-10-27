# UsTwo – puzzles for two

Static site (no backend, no API keys). Two players connect directly with WebRTC (PeerJS).
3 levels x 3 steps (riddle, Zip path, word cross). Both players must finish a step to go on.

## Run locally
    npx serve .        # or: python3 -m http.server 8000
Open it in two browser tabs/devices: one taps "Create a room", the other joins with the code.

## Deploy on Vercel
1. Push this folder to a GitHub repo, then vercel.com/new -> import it -> Deploy (no build settings needed).
   Or run `npx vercel --prod` inside this folder.
2. Open your https://xxx.vercel.app link on both phones/laptops.

## Install on mobile
- Android (Chrome): menu -> Install app (or the "Install app" button in the lobby).
- iPhone (Safari): Share -> Add to Home Screen.

## Add your own puzzles
Edit the `LV` array at the top of `app.js` (riddle, zip path moves, crossword words + hints).
