import { useEffect, useState } from "react";
import IConfigItem from "./IConfigItem";

const RootConfigStorageKey = "config"; // legacy support

const CreateTypedConfigItem = <TConfig>(
    forContext: boolean,
    deserializer: (configValue: string) => TConfig,
    serializer: (runtimeValue: TConfig) => string,
    defaultValue: TConfig,
    storageKey: string,
    password?: boolean,
    effect?: (newValue: TConfig) => void
): IConfigItem<TConfig> => {
    const fullStorageKey = `${RootConfigStorageKey}.${storageKey}`;
    const loader = () =>
        deserializer(
            localStorage.getItem(fullStorageKey) || serializer(defaultValue)
        );

    if (forContext) {
        return {
            value: defaultValue,
            setValue: () => null,
            password: password || false,
        };
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<TConfig>(loader);

    if (effect) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            effect(value);
        }, [value, effect]);
    }

    return {
        value,
        setValue: (newValue) => {
            const storageValue = serializer(newValue);
            if (storageValue) {
                localStorage.setItem(fullStorageKey, storageValue);
            } else {
                localStorage.removeItem(fullStorageKey);
            }

            setValue(newValue);
        },
        password: password || false,
    };
};

export const CreateStringConfigItem = (
    forContext: boolean,
    defaultValue: string,
    storageKey: string,
    password?: boolean
) =>
    CreateTypedConfigItem<string>(
        forContext,
        (configValue) => configValue,
        (runtimeValue) => runtimeValue,
        defaultValue,
        storageKey,
        password
    );

export default CreateTypedConfigItem;
