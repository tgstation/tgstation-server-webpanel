import { Meta } from "@storybook/react";

import Loading from "./Loading";

const config: Meta<typeof Loading> = {
    component: Loading,
    title: "Utils/Loading"
};

export default config;

export const NoText = () => <Loading />;
export const TranslatedLoadingText = () => <Loading message="loading.loading" />;
export const UntranslatedText = () => <Loading message="Untranslated" noIntl />;
