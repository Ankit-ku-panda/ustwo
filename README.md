# UsTwo Arcade

Static site: index.html, style.css, script.js, plus the standalone Duck Dash, Cheese Tower, and Potato Whack games in arcade.html, arcade.css, and arcade.js. No build step.

## Play together
1. Open the deployed site on both devices and choose a username.
2. One player selects **Create room** and shares the room code or invite link.
3. The other player enters the code with **Join room**.
4. The host chooses one of the seven games. Each player solves the same level on their own device; the room advances only after both finish.

Two-player rooms use four-digit codes and PeerJS/WebRTC, so they need an internet connection. The host must keep the room page open; room codes expire when the host closes or reloads it. Game progress is saved separately in each player's browser. All seven built-in games have 50 levels; difficulty increases as players advance, and the three arcade games clear a level when the score target is reached.

## Install on mobile
- Android (Chrome): open the site menu and choose **Install app** or **Add to Home screen**.
- iPhone/iPad (Safari): tap **Share**, then **Add to Home Screen**.
- The site must be opened over HTTPS for installation and offline caching to work.

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. In Vercel, choose Add New > Project and import the repo.
3. Framework preset: Other. Leave build command and output directory empty.
4. Deploy.

Or with the CLI: `npm i -g vercel`, then run `vercel` in this folder.

## Add levels
Edit the RIDDLES, WORDS, and MEM_ICONS lists at the top of script.js to change puzzle content. Level scaling and score targets are configured alongside them.
