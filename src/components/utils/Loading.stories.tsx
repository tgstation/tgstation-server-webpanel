import { Meta } from "@storybook/react";
import Loading from "./Loading";

const config: Meta<typeof Loading> = {
    component: Loading,
    title: "Loading Spinner",
};

export default config;

export const NoText = () => <Loading />;
export const LoadingText = () => <Loading messageId="loading.loading" />;
