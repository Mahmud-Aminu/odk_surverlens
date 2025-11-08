/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Include the paths to all files that contain NativeWind classes.
  // This project uses the Expo Router `app/` directory, so include it and components.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./supervisor/**/*.{js,jsx,ts,tsx}",
    "./odk/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
