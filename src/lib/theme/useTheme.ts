import { useContext } from "react";
import ThemeProviderContext from "./Context";

const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};

export default useTheme;
