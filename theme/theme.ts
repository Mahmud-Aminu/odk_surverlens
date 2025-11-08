// Theme object using Tailwind color tokens from tailwind.config.js
export const lightTheme = {
  mode: "light",
  colors: {
    primary: "#2E7D32",
    secondary: "#FFB300",
    warning: "#FF6F00",
    success: "#1976D2",
    background: "bg-gray-100",
    text: "text-gray-600",
    cardBg: "bg-white",
    cardBorder: "rgba(0,0,0,0.08)",
  },
};

export const darkTheme = {
  mode: "dark",
  colors: {
    primary: "bg-gray-900",
    secondary: "#FFA000",
    warning: "#EF6C00",
    success: "#1E88E5",
    background: "bg-gray-600",
    text: "text-gray-400",
    cardBg: "bg-gray-800",
    cardBorder: "rgba(255,255,255,0.08)",
  },
};

// const bgClass = isDark ? '' : 'bg-gray-100';
// const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
// const textPrimaryClass = isDark ? 'text-gray-100' : 'text-gray-800';
// const textSecondaryClass = isDark ? 'text-gray-400' : 'text-gray-600';
// const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
// const hoverBgClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
// const activeBgClass = isDark ? 'active:bg-gray-600' : 'active:bg-gray-100';
// const inputBgClass = isDark ? 'bg-gray-700' : 'bg-white';
// const inputBorderClass = isDark ? 'border-gray-600' : 'border-gray-300';
