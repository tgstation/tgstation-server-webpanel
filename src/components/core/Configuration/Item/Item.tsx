import { ReactNode, useEffect, useState } from "react";

import InputGroup from "@/components/utils/InputGroup/InputGroup";
import IConfigItem from "@/context/config/IConfigItem";

interface IProps<TConfig> {
    configItem: IConfigItem<TConfig>;
    input: (state: TConfig, setState: (newValue: TConfig) => void) => ReactNode;
    onSave: (callback: () => void) => void;
}

const Item = <TConfig,>(props: IProps<TConfig>) => {
    const [state, setState] = useState(props.configItem.value);

    useEffect(() => {
        props.onSave(() => {
            if (state != props.configItem.value) {
                console.log("Saving " + props.configItem.localizationId);
                props.configItem.setValue(state);
            }
        });
    }, [state, props]);

    return (
        <InputGroup
            label={props.configItem.localizationId}
            tooltip={`${props.configItem.localizationId}.desc`}>
            {props.input(state, setState)}
        </InputGroup>
    );
};

export default Item;
