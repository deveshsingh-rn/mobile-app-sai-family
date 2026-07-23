const baseConfig = require("./app.json").expo;

const APP_VARIANT = process.env.APP_VARIANT || "production";
const isDevelopmentVariant = APP_VARIANT === "development";

const productionBundleId = "com.deveshrn.saifamily";
const developmentBundleId = "com.deveshrn.saifamily.dev";
const productionProjectId = "d751b428-eab5-47a0-8ed0-4782b79d0e40";
const developmentProjectId = "9bac67f9-6593-4c9b-b54f-f9cec26f2dda";
const productionOwner = "devesh-rn";
const developmentOwner = "saifamilys-team";

module.exports = ({ config }) => {
  const bundleIdentifier = isDevelopmentVariant
    ? developmentBundleId
    : productionBundleId;
  const owner =
    process.env.EXPO_OWNER ||
    (isDevelopmentVariant ? developmentOwner : productionOwner);
  const projectId =
    process.env.EAS_PROJECT_ID ||
    (isDevelopmentVariant ? developmentProjectId : productionProjectId);

  return {
    ...config,
    ...baseConfig,
    name: isDevelopmentVariant ? "Sai Family Dev" : "Sai Family",
    slug: isDevelopmentVariant ? "sai-family-dev" : baseConfig.slug,
    scheme: isDevelopmentVariant ? "saifamilydev" : baseConfig.scheme,
    owner,
    ios: {
      ...baseConfig.ios,
      bundleIdentifier,
    },
    android: {
      ...baseConfig.android,
      package: bundleIdentifier,
    },
    extra: {
      ...baseConfig.extra,
      appVariant: APP_VARIANT,
      eas: {
        ...baseConfig.extra?.eas,
        projectId,
      },
    },
  };
};
