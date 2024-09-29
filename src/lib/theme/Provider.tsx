import { useEffect, useState } from "react";
import Theme from "./Theme";
import ThemeProviderContext from "./Context";

interface IProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

const ThemeProvider = (props: IProps) => {
    const defaultTheme = props.defaultTheme || "system";
    const storageKey = props.storageKey || "tgswp-ui-theme";
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {props.children}
        </ThemeProviderContext.Provider>
    );
};

export default ThemeProvider;
