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

  if (type === "heading") base = "  text-1xl font-bold leading-tight";
  if (type === "subheading")
    base = "text-md sm:text-md lg:text-3xl font-semibold";
  if (type === "body") base = "text-sm md:text-xm leading-relaxed";
  if (type === "tag") base = "text-xs sm:text-sm uppercase tracking-wide";
  if (type === "link") base = "text-xm md:text-xm ";
  if (type === "none") base = "";

  const getFontSize = () => {
    let base = hp("3");
    if (type === "heading") base = hp(3);
    if (type === "subheading") hp(2);
    if (type === "body") base = hp(1.8);
    if (type === "tag") base = hp("1.5%");
    if (type === "link") base = hp("1.5%");
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
