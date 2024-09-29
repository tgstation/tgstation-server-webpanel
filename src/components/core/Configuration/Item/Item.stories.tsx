import { Meta } from "@storybook/react";
import Item from "./Item";

const config: Meta<typeof Item> = {
    component: Item,
    title: "Config Item",
};

export default config;

export const Default = () => <Item />;
