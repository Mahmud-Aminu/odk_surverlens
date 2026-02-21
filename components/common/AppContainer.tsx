import useTheme from "@/theme";
import { clsx } from "clsx";
import { View, ViewProps } from "react-native";

type AppContainerProps = ViewProps & {
  className: string;
};

const AppContainer = ({
  className,
  children,
  ...otherProps
}: AppContainerProps) => {
  const { mode } = useTheme();
  const bgClass = mode === "light" ? "bg-gray-100" : "bg-gray-900";

  const mergedClass = clsx("min-h-screen", bgClass, className);

  return (
    <View style={{ flex: 1 }} className={mergedClass} {...otherProps}>
      {children}
    </View>
  );
};
export default AppContainer;
