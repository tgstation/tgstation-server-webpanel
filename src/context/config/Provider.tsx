import CreateConfig from "./CreateConfig";
import ConfigContext from "./Context";

interface IProps {
    children: React.ReactNode;
}

const ConfigProvider = (props: IProps) => {
    const config = CreateConfig(false);
    return (
        <ConfigContext.Provider value={config}>
            {props.children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;
