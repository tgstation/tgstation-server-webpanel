import { createContext } from "react";
import Theme from "./Theme";

interface IThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<IThemeState>({
    theme: "system",
    setTheme: () => null,
});
export default ThemeContext;
