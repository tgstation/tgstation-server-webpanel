import React, { FC } from "react";

import ConfigProvider from "../src/context/config/ConfigProvider";

const AddConfigDark = (Story: FC) => {
    return (
        <ConfigProvider darkOverride>
            <Story />
        </ConfigProvider>
    );
};

export default AddConfigDark;
