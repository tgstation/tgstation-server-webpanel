import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import {
    ConfigurationType,
    InstanceManagerRights
} from "../../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InstanceClient from "../../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { resolvePermissionSet } from "../../../../utils/misc";
import ErrorAlert from "../../../utils/ErrorAlert";
import InputField from "../../../utils/InputField";

interface IProps extends RouteComponentProps {}
interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    editLock: boolean;
}

class InstanceSettings extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            editLock: false,
            errors: []
        };
    }

    private addError(error: InternalError<ErrorCode>): void {
        this.setState(prevState => {
            const errors = Array.from(prevState.errors);
            errors.push(error);
            return {
                errors
            };
        });
    }

    private async _editInstance(instance: Omit<Components.Schemas.InstanceUpdateRequest, "id">) {
        const response = await InstanceClient.editInstance({
            ...instance,
            id: this.context.instance.id
        });
        if (response.code === StatusCode.OK) {
            this.context.reloadInstance();
        } else {
            this.addError(response.error);
        }
    }

    private editInstance(instance: Omit<Components.Schemas.InstanceUpdateRequest, "id">) {
        void this._editInstance(instance);
    }

    public render(): React.ReactNode {
        const checkIMFlag = (flag: InstanceManagerRights) => {
            return resolvePermissionSet(this.context.user).instanceManagerRights & flag;
        };

        const setEditLock = (value: boolean) => {
            this.setState({
                editLock: value
            });
        };

        return (
            <div className="text-center">
                {this.state.errors.map((err, index) => {
                    if (!err) return;
                    return (
                        <ErrorAlert
                            key={index}
                            error={err}
                            onClose={() =>
                                this.setState(prev => {
                                    const newarr = Array.from(prev.errors);
                                    newarr[index] = undefined;
                                    return {
                                        errors: newarr
                                    };
                                })
                            }
                        />
                    );
                })}

                <InputField
                    name="instance.name"
                    defaultValue={this.context.instance.name}
                    type="str"
                    onChange={newval => {
                        this.editInstance({ name: newval });
                    }}
                    disabled={!checkIMFlag(InstanceManagerRights.Rename)}
                    setEditLock={setEditLock}
                    editLock={this.state.editLock}
                />
                <InputField
                    name="instance.path"
                    defaultValue={this.context.instance.path}
                    type="str"
                    onChange={newval => {
                        this.editInstance({ path: newval });
                    }}
                    disabled={!checkIMFlag(InstanceManagerRights.Relocate)}
                    setEditLock={setEditLock}
                    editLock={this.state.editLock}
                />
                <InputField
                    name="instance.chatbotlimit"
                    defaultValue={this.context.instance.chatBotLimit}
                    type="num"
                    onChange={newval => {
                        this.editInstance({ chatBotLimit: newval });
                    }}
                    disabled={!checkIMFlag(InstanceManagerRights.SetChatBotLimit)}
                    setEditLock={setEditLock}
                    editLock={this.state.editLock}
                />
                <InputField
                    name="instance.autoupdate"
                    defaultValue={this.context.instance.autoUpdateInterval}
                    type="num"
                    onChange={newval => {
                        this.editInstance({
                            autoUpdateInterval: newval
                        });
                    }}
                    disabled={!checkIMFlag(InstanceManagerRights.SetAutoUpdate)}
                    setEditLock={setEditLock}
                    editLock={this.state.editLock}
                />
                <InputField
                    name="instance.filemode"
                    defaultValue={ConfigurationType[this.context.instance.configurationType]}
                    type="enum"
                    enum={ConfigurationType}
                    onChange={newval => {
                        this.editInstance({
                            // @ts-expect-error typescript isnt a fan of using enums like this
                            configurationType: ConfigurationType[newval] as 0 | 1 | 2
                        });
                    }}
                    disabled={!checkIMFlag(InstanceManagerRights.SetConfiguration)}
                    setEditLock={setEditLock}
                    editLock={this.state.editLock}
                />
            </div>
        );
    }
}
InstanceSettings.contextType = InstanceEditContext;
export default withRouter(InstanceSettings);
