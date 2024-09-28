import type { Preview } from "@storybook/react";
import AddIntlEn from "./AddIntlEn";

import "../src/index.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: [AddIntlEn],
};

export default preview;
