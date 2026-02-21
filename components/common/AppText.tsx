import { useTheme } from "@/theme/ThemeContext";
import { Text, TextProps } from "react-native";

import { heightPercentageToDP as hp } from "react-native-responsive-screen";
type AppTextProps = TextProps & {
  type?: "heading" | "subheading" | "body" | "tag" | "link" | "none";
  className?: string;
  children?: React.ReactNode;
};

const AppText = ({
  type = "body",
  children,
  className,
  ...rest
}: AppTextProps) => {
  const { mode } = useTheme();
  const textColor = mode === "dark" ? "text-gray-400" : "text-gray-600";
  let base;

  if (type === "heading") base = "font-bold leading-tight";
  if (type === "subheading") base = "font-semibold";
  if (type === "body") base = "leading-relaxed";
  if (type === "tag") base = "uppercase tracking-wide";
  if (type === "link") base = "";
  if (type === "none") base = "";

  const getFontSize = () => {
    let base = hp("1.4");
    if (type === "heading") base = hp(2);
    if (type === "subheading") hp(1.8);
    if (type === "body") base = hp(1.5);
    if (type === "tag") base = hp("1.3%");
    if (type === "link") base = hp("1.1%");
    return base;
  };

  const mergedStyles = [className, base, textColor].filter(Boolean).join(" ");
  return (
    <Text
      {...rest}
      style={{ fontSize: getFontSize() }}
      className={mergedStyles}
    >
      {children}
    </Text>
  );
};

export default AppText;
