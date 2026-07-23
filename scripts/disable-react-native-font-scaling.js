const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function patchFile(relativePath, replacements) {
  const filePath = path.join(root, relativePath);

  if (!fs.existsSync(filePath)) {
    console.warn(`[font-scaling] Missing ${relativePath}`);
    return;
  }

  let source = fs.readFileSync(filePath, "utf8");
  let nextSource = source;

  for (const [from, to] of replacements) {
    if (!nextSource.includes(to)) {
      if (!nextSource.includes(from)) {
        console.warn(
          `[font-scaling] Pattern not found in ${relativePath}: ${from}`
        );
        continue;
      }

      nextSource = nextSource.replace(from, to);
    }
  }

  if (nextSource !== source) {
    fs.writeFileSync(filePath, nextSource);
    console.log(`[font-scaling] Patched ${relativePath}`);
  }
}

patchFile("node_modules/react-native/Libraries/Text/Text.js", [
  [
    "allowFontScaling: allowFontScaling !== false,",
    "allowFontScaling: false,\n          maxFontSizeMultiplier: 1,",
  ],
  [
    "allowFontScaling={allowFontScaling !== false}",
    "allowFontScaling={false}",
  ],
  [
    "numberOfLines={_numberOfLines}\n        ref={forwardedRef}",
    "numberOfLines={_numberOfLines}\n        maxFontSizeMultiplier={1}\n        ref={forwardedRef}",
  ],
]);

patchFile(
  "node_modules/react-native/Libraries/Components/TextInput/TextInput.js",
  [
    ["allowFontScaling = true,", "allowFontScaling = false,"],
    [
      "allowFontScaling={allowFontScaling}",
      "allowFontScaling={false}\n      maxFontSizeMultiplier={1}",
    ],
  ]
);
