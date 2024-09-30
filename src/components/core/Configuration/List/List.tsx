import ConfigContext from "@/context/config/Context";
import { useContext } from "react";
import Item from "../Item/Item";
import EnumDropdown from "@/components/utils/EnumDropdown/EnumDropdown";
import Theme from "@/context/config/Theme";
import { Input } from "@/components/ui/input";
import { JobsWidgetOptions } from "@/context/config/CreateConfig";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";

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
                        />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.ApiPath}
                    input={(currentValue) => <Input value={currentValue} />}
                    onSave={onSave}
                />
                <Item
                    configItem={config.GitHubToken}
                    input={(currentValue) => (
                        <Input type="password" value={currentValue} />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.JobsWidgetDisplay}
                    input={(currentValue) => (
                        <EnumDropdown
                            enum={JobsWidgetOptions}
                            value={currentValue}
                        />
                    )}
                    onSave={onSave}
                />
                <Item
                    configItem={config.ManualPR}
                    input={(currentValue) => <Switch checked={currentValue} />}
                    onSave={onSave}
                />
                <Item
                    configItem={config.ShowJson}
                    input={(currentValue) => <Switch checked={currentValue} />}
                    onSave={onSave}
                />
            </div>
            <div className="grid grid-cols-3">
                <Button
                    className="col-start-2"
                    onClick={() => {
                        saveCallbacks.forEach((callback) => callback());
                    }}
                >
                    <FormattedMessage id="generic.save" />
                </Button>
            </div>
        </div>
    );
};

export default List;
