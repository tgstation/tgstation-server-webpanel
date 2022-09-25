import React from "react";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import {
    ConfigurationType,
    InstanceManagerRights,
    InstanceUpdateRequest
} from "../../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasInstanceManagerRight, resolvePermissionSet } from "../../../../utils/misc";
import ErrorAlert from "../../../utils/ErrorAlert";
import { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";

interface IProps extends RouteComponentProps {}
interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
}

class InstanceSettings extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.editInstance = this.editInstance.bind(this);

        this.state = {
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

    private async editInstance(instance: Omit<InstanceUpdateRequest, "id">) {
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

    public render(): React.ReactNode {
        const checkIMFlag = (flag: InstanceManagerRights) => {
            return hasInstanceManagerRight(resolvePermissionSet(this.context.user), flag);
        };

        const fields = {
            name: {
                name: "fields.instance.name",
                type: FieldType.String as FieldType.String,
                defaultValue: this.context.instance.name,
                disabled: !checkIMFlag(InstanceManagerRights.Rename)
            },
            path: {
                name: "fields.instance.path",
                type: FieldType.String as FieldType.String,
                defaultValue: this.context.instance.path,
                disabled: !checkIMFlag(InstanceManagerRights.Relocate)
            },
            chatBotLimit: {
                name: "fields.instance.chatbotlimit",
                type: FieldType.Number as FieldType.Number,
                min: 0,
                defaultValue: this.context.instance.chatBotLimit,
                disabled: !checkIMFlag(InstanceManagerRights.SetChatBotLimit)
            },
            autoUpdateInterval: {
                name: "fields.instance.autoupdate",
                type: FieldType.Number as FieldType.Number,
                min: 0,
                defaultValue: this.context.instance.autoUpdateInterval,
                disabled: !checkIMFlag(InstanceManagerRights.SetAutoUpdate)
            },
            configurationType: {
                name: "fields.instance.filemode",
                type: FieldType.Enum as FieldType.Enum,
                enum: ConfigurationType,
                defaultValue: this.context.instance.configurationType,
                disabled: !checkIMFlag(InstanceManagerRights.SetConfiguration)
            }
        };

        return (
            <div className="text-center">
                <h1>
                    <FormattedMessage id="view.instance.info" />
                </h1>
                <DebugJsonViewer obj={this.context} />
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

                <InputForm fields={fields} onSave={this.editInstance} />
            </div>
        );
    }
}
InstanceSettings.contextType = InstanceEditContext;
export default withRouter(InstanceSettings);
