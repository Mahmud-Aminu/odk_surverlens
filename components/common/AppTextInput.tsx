import useTheme from "@/theme";
import { clsx } from "clsx";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type Props = (InputProps | TextAreaProps) & { multiline?: boolean };

export default function AppTextInput({ multiline, className, ...rest }: Props) {
  const { mode } = useTheme();

  //   const baseStyle: React.CSSProperties = {
  //     backgroundColor: theme.colors.cardBg,
  //     borderColor: theme.colors.primary,
  //     color: theme.colors.text,
  //     fontSize: 14,
  //     borderRadius: 8,
  //     ...style,
  //   };
  const modeColors = mode === "dark" ? "text-gray-400" : "text-gray-600";

  const base =
    "w-full pl-12 pr-12 py-3 text-gray-500 rounded-xl border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors";

  const mergedClassname = clsx(base, modeColors, className);

  if (multiline) {
    // Only pass textarea props to textarea
    const { ...textareaRest } = rest as TextAreaProps;
    return (
      <textarea
        style={{ height: 80 }}
        className={mergedClassname}
        {...textareaRest}
      />
    );
  }

  // Only pass input props to input
  const { ...inputRest } = rest as InputProps;
  return <input className={mergedClassname} {...inputRest} />;
}
