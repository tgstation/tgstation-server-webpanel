import CreateTypedConfigItem, {
    CreateStringConfigItem,
} from "./CreateConfigItem";
import Theme from "./Theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const publicPath = (window as any).publicPath as string;
const DefaultServerUrl = "http://localhost:5000";

const InitialServerUrl = import.meta.env.DEV
    ? DefaultServerUrl
    : publicPath
    ? new URL("..", new URL(publicPath, window.location.href)).href
    : DefaultServerUrl;

export enum JobsWidgetOptions {
    Auto = "auto",
    Always = "always",
    Never = "never",
}

const CreateConfig = (forContext: boolean, darkOverride?: boolean) => {
    return {
        Theme: CreateTypedConfigItem<Theme>(
            forContext,
            (configValue) => configValue as Theme,
            (runtimeValue) => runtimeValue.toString(),
            darkOverride ? "dark" : "system",
            "theme",
            (theme) => {
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
            }
        ),
        GitHubToken: CreateStringConfigItem(forContext, "", "githubtoken"),
        ApiPath: CreateStringConfigItem(
            forContext,
            InitialServerUrl,
            "serverUrl"
        ),
        JobsWidgetDisplay: CreateTypedConfigItem<JobsWidgetOptions>(
            forContext,
            (configValue) => configValue as JobsWidgetOptions,
            (runtimeValue) => runtimeValue,
            JobsWidgetOptions.Auto,
            "jobswidgedisplay"
        ),
        ShowJson: CreateTypedConfigItem<boolean>(
            forContext,
            (configValue) => configValue === "true",
            (runtimeValue) => runtimeValue.toString(),
            import.meta.env.DEV,
            "showjson"
        ),
        ManualPR: CreateTypedConfigItem<boolean>(
            forContext,
            (configValue) => configValue === "true",
            (runtimeValue) => runtimeValue.toString(),
            true,
            "manualpr"
        ),
    };
};

export default CreateConfig;
