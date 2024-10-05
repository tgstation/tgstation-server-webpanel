import { Meta } from "@storybook/react";

import ReportIssue from "./ReportIssue";

const config: Meta<typeof ReportIssue> = {
    component: ReportIssue,
    title: "Core/Report Issue"
};

export default config;

export const Default = () => <ReportIssue />;
