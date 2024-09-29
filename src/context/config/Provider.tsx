import CreateConfig from "./CreateConfig";
import ConfigContext from "./Context";

interface IProps {
    children: React.ReactNode;
    darkOverride?: boolean;
}

const ConfigProvider = (props: IProps) => {
    const config = CreateConfig(false, props.darkOverride);
    return (
        <ConfigContext.Provider value={config}>
            {props.children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;
