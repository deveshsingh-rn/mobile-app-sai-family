import { Text, TextInput } from "react-native";

type FontScalingComponent = {
  defaultProps?: {
    allowFontScaling?: boolean;
    maxFontSizeMultiplier?: number;
    [key: string]: unknown;
  };
  render?: (props: Record<string, unknown>, ref: unknown) => unknown;
  __saiFamilyFontScalingPatched?: boolean;
};

const disableFontScalingFor = (component: FontScalingComponent) => {
  component.defaultProps = {
    ...component.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };

  if (!component.render || component.__saiFamilyFontScalingPatched) {
    return;
  }

  const originalRender = component.render;

  component.render = function renderWithoutFontScaling(props, ref) {
    return originalRender.call(this, {
      ...props,
      allowFontScaling: false,
      maxFontSizeMultiplier: 1,
    }, ref);
  };

  component.__saiFamilyFontScalingPatched = true;
};

disableFontScalingFor(Text as unknown as FontScalingComponent);
disableFontScalingFor(TextInput as unknown as FontScalingComponent);
