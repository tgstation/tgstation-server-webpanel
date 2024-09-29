export default interface IConfigItem<TConfig> {
    value: TConfig;
    setValue: (newValue: TConfig) => void;
    password: boolean;
}
