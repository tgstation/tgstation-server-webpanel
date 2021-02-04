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
import { RequireAtLeastOne } from "../../../../ApiClient/ServerClient";
import ErrorAlert from "../../../utils/ErrorAlert";
import InputField from "../../../utils/InputField";
import Loading from "../../../utils/Loading";

interface IProps extends RouteComponentProps {
    instance: Components.Schemas.Instance;
    loadInstance: () => unknown;
    selfPermissionSet: Components.Schemas.PermissionSet;
}
interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
}

export default withRouter(
    class InstanceSettings extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.state = {
                loading: false,
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

        private async _editInstance(instance: RequireAtLeastOne<Components.Schemas.Instance>) {
            const response = await InstanceClient.editInstance({
                ...instance,
                id: this.props.instance.id
            });
            if (response.code === StatusCode.OK) {
                this.setState({
                    loading: true
                });
                await this.props.loadInstance();
                this.setState({
                    loading: false
                });
            } else {
                this.addError(response.error);
            }
        }

        private editInstance(instance: RequireAtLeastOne<Components.Schemas.Instance>) {
            void this._editInstance(instance);
        }

        public render(): React.ReactNode {
            if (this.state.loading) {
                return <Loading text="loading.instance" />;
            }

            const checkIMFlag = (flag: InstanceManagerRights) => {
                return this.props.selfPermissionSet.instanceManagerRights! & flag;
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
                        defaultValue={this.props.instance.name}
                        type="str"
                        onChange={newval => {
                            this.editInstance({ name: newval });
                        }}
                        disabled={!checkIMFlag(InstanceManagerRights.Rename)}
                    />
                    <InputField
                        name="instance.path"
                        defaultValue={this.props.instance.path}
                        type="str"
                        onChange={newval => {
                            this.editInstance({ path: newval });
                        }}
                        disabled={!checkIMFlag(InstanceManagerRights.Relocate)}
                    />
                    <InputField
                        name="instance.chatbotlimit"
                        defaultValue={this.props.instance.chatBotLimit!}
                        type="num"
                        onChange={newval => {
                            this.editInstance({ chatBotLimit: newval });
                        }}
                        disabled={!checkIMFlag(InstanceManagerRights.SetChatBotLimit)}
                    />
                    <InputField
                        name="instance.autoupdate"
                        defaultValue={this.props.instance.autoUpdateInterval!}
                        type="num"
                        onChange={newval => {
                            this.editInstance({
                                autoUpdateInterval: newval
                            });
                        }}
                        disabled={!checkIMFlag(InstanceManagerRights.SetAutoUpdate)}
                    />
                    <InputField
                        name="instance.filemode"
                        defaultValue={ConfigurationType[this.props.instance.configurationType!]}
                        type="enum"
                        enum={ConfigurationType}
                        onChange={newval => {
                            this.editInstance({
                                // @ts-expect-error typescript isnt a fan of using enums like this
                                configurationType: ConfigurationType[newval] as 0 | 1 | 2
                            });
                        }}
                        disabled={!checkIMFlag(InstanceManagerRights.SetConfiguration)}
                    />
                </div>
            );
        }
    }
);
