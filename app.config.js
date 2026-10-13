const baseConfig = require("./app.json").expo;

const APP_VARIANT = process.env.APP_VARIANT || "production";
const isDevelopmentVariant = APP_VARIANT === "development";
const isMainDevelopmentVariant = APP_VARIANT === "main-development";
const isDevelopmentBinary =
  isDevelopmentVariant || isMainDevelopmentVariant;

const productionIosBundleId = "com.vpilimited.saifamily";
const developmentIosBundleId = "com.deveshrn.saifamily.dev";
const productionAndroidPackage = "com.deveshrn.saifamily";
const developmentAndroidPackage = "com.deveshrn.saifamily.dev";
const productionProjectId = "d751b428-eab5-47a0-8ed0-4782b79d0e40";
const developmentProjectId = "9bac67f9-6593-4c9b-b54f-f9cec26f2dda";
const productionOwner = "devesh-rn";
const developmentOwner = "saifamilys-team";

module.exports = ({ config }) => {
  const iosBundleIdentifier = isDevelopmentVariant
    ? developmentIosBundleId
    : productionIosBundleId;
  const androidPackage = isDevelopmentVariant
    ? developmentAndroidPackage
    : productionAndroidPackage;
  const owner = isDevelopmentVariant
    ? developmentOwner
    : productionOwner;
  const projectId = isDevelopmentVariant
    ? developmentProjectId
    : productionProjectId;

  return {
    ...config,
    ...baseConfig,
    name: isDevelopmentBinary ? "Sai Family Dev" : "Sai Family",
    slug: isDevelopmentVariant ? "saifamily" : baseConfig.slug,
    scheme: isDevelopmentBinary ? "saifamilydev" : baseConfig.scheme,
    owner,
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: iosBundleIdentifier,
    },
    android: {
      ...baseConfig.android,
      package: androidPackage,
    },
    plugins: [
      ...(baseConfig.plugins || []),
      "expo-asset",
    ],
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
