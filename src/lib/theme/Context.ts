import { createContext } from "react";
import Theme from "./Theme";

interface IThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const initialState: IThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<IThemeProviderState>(initialState);
export default ThemeProviderContext;
