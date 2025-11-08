// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    settings: {
      // Let eslint-plugin-import resolve TypeScript declaration files and paths
      "import/resolver": {
        typescript: {},
      },
      // Treat the @env module as a known core module so import/no-unresolved won't fail
      "import/core-modules": ["@env"],
    },
  },
]);
