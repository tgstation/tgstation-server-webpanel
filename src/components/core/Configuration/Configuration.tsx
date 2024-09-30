import InputGroup from "@/components/utils/InputGroup/InputGroup";
import ConfigContext from "@/context/config/Context";
import IConfigItem from "@/context/config/IConfigItem";
import { useContext } from "react";

const Configuration = () => {
    const config = useContext(ConfigContext);

    const groupForConfig = <TConfig,>(configItem: IConfigItem<TConfig>) => {
        return (
            <InputGroup
                label={configItem.localizationId}
                tooltip={`${configItem.localizationId}.desc`}
            />
        );
    };

    return (
        <div className="grid grid-rows-6 grid-cols-2">
            {groupForConfig(config.Theme)}
            {groupForConfig(config.ApiPath)}
            {groupForConfig(config.GitHubToken)}
            {groupForConfig(config.JobsWidgetDisplay)}
            {groupForConfig(config.ManualPR)}
            {groupForConfig(config.ShowJson)}
        </div>
    );
};

export default Configuration;
