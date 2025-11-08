import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AppText from "../components/common/AppText";
import { useTheme } from "./ThemeContext";

const ThemeToggleButton = () => {
  const { mode, toggleTheme, theme } = useTheme();
  return (
    <TouchableOpacity onPress={toggleTheme}>
      {mode === "light" ? (
        <AppText>
          <Feather name="moon" size={24} color={theme.colors.text} />
        </AppText>
      ) : (
        <AppText>
          <Feather name="sun" size={24} color={theme.colors.text} />
        </AppText>
      )}
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;
