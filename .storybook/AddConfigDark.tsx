import React, { FC } from "react";
import ConfigProvider from "../src/context/config/Provider";

const AddConfigDark = (Story: FC) => {
    return (
        <ConfigProvider darkOverride>
            <Story />
        </ConfigProvider>
    );
};

export default AddConfigDark;
