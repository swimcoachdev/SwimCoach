// Dynamic Expo config layered on top of app.json.
//
// Sole purpose: set the web `baseUrl` when deploying to GitHub Pages, which serves project
// sites under a subpath (https://<user>.github.io/SwimCoach/). Without it, the exported
// bundle requests assets from the domain root and the page renders blank.
//
// Local dev and native builds leave EXPO_WEB_BASE_PATH unset, so baseUrl stays at root and
// `npx expo start --web` works exactly as before. Only the CI web build sets it.
const baseUrl = process.env.EXPO_WEB_BASE_PATH;

module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(baseUrl ? { baseUrl } : {}),
  },
});
