import type { Preview } from "@storybook/react";

import AddConfigDark from "./AddConfigDark";
import AddIntlEn from "./AddIntlEn";

import "@/index.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        }
    },
    decorators: [AddIntlEn, AddConfigDark]
};

export default preview;
