import { useContext } from "react";
import { FormattedMessage } from "react-intl";

import Item from "./Item/Item";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import EnumDropdown from "@/components/utils/EnumDropdown/EnumDropdown";
import ConfigContext from "@/context/config/Context";
import { JobsWidgetOptions } from "@/context/config/CreateConfig";
import Theme from "@/context/config/Theme";

const List = () => {
    const config = useContext(ConfigContext);

    const saveCallbacks: (() => void)[] = [];

    const onSave = (newCallback: () => void) => saveCallbacks.push(newCallback);

    return (
        <div className="grid grid-rows-2 gap-4">
            <div className="grid grid-rows-6 grid-cols-2 gap-y-px">
                <Item
                    configItem={config.Theme}
                    input={(currentValue, setValue) => (
                        <EnumDropdown
                            enum={Theme}
                            value={currentValue}
                            onChange={setValue}
                            noIntl
                        />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.ApiPath}
                    input={(currentValue, setValue) => (
                        <Input
                            value={currentValue}
                            onChange={event => setValue(event.target.value)}
                        />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.GitHubToken}
                    input={(currentValue, setValue) => (
                        <Input
                            type="password"
                            value={currentValue}
                            onChange={event => setValue(event.target.value)}
                        />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.JobsWidgetDisplay}
                    input={(currentValue, setValue) => (
                        <EnumDropdown
                            enum={JobsWidgetOptions}
                            value={currentValue}
                            noIntl
                            onChange={setValue}
                        />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.ManualPR}
                    input={(currentValue, setValue) => (
                        <Switch checked={currentValue} onCheckedChange={setValue} />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.ShowJson}
                    input={(currentValue, setValue) => (
                        <Switch checked={currentValue} onCheckedChange={setValue} />
                    )}
                    onSave={onSave}
                />
            </div>
            <div className="grid grid-cols-3">
                <Button
                    className="col-start-2"
                    onClick={() => {
                        saveCallbacks.forEach(callback => callback());
                    }}>
                    <FormattedMessage id="generic.save" />
                </Button>
            </div>
        </div>
    );
};

export default List;
