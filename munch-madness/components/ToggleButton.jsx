import React from "react";
import { useTheme } from "./ThemeContext";
import { Moon, Sun } from "lucide-react";

const ToggleButton = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      {darkMode ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

export default ToggleButton;
