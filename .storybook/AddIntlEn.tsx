import { FC } from "react";
import { IntlProvider } from "react-intl";

import localization from "../src/translations/locales/en.json";

const AddIntlEn = (Story: FC) => {
    return (
        <IntlProvider
            locale="en"
            defaultLocale="en"
            messages={localization as { [key: string]: string }}
        >
            <Story />
        </IntlProvider>
    );
};

export default AddIntlEn;
