import React from "react";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import {
    ConfigurationType,
    InstanceManagerRights,
    InstanceResponse,
    InstanceUpdateRequest
} from "../../../../ApiClient/generatedcode/generated";
import InstanceClient, { GetInstanceErrors } from "../../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import InternalStatus, {
    StatusCode
} from "../../../../ApiClient/models/InternalComms/InternalStatus";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasInstanceManagerRight, resolvePermissionSet } from "../../../../utils/misc";
import ErrorAlert from "../../../utils/ErrorAlert";
import { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";

interface IProps extends RouteComponentProps {}
interface IState {
    moving: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
}

class InstanceSettings extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.editInstance = this.editInstance.bind(this);

        this.state = {
            errors: [],
            moving: false
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
        const instanceId = this.context.instance.id;
        let newPath: string | undefined;
        if (instance.path && instance.path != this.context.instance.path) {
            newPath = instance.path;
            instance.path = null;
            instance.online = false; // need to offline the instance before moving it
            this.setState({ moving: true });
        }

        const response = await InstanceClient.editInstance({
            ...instance,
            id: instanceId
        });
        if (response.code !== StatusCode.OK) {
            this.addError(response.error);
            this.setState({ moving: false });
            return;
        }

        if (newPath) {
            //move the instance
            const response2 = await InstanceClient.editInstance({
                id: this.context.instance.id,
                path: newPath
            });

            if (response2.code !== StatusCode.OK) {
                this.addError(response2.error);
                this.setState({ moving: false });
                await this.context.reloadInstance();
                return;
            }

            // we can't use the jobs controller because instance move jobs are special so just wait until the move is done
            let response3: InternalStatus<InstanceResponse, GetInstanceErrors>;
            do {
                await new Promise(resolve => setTimeout(resolve, 1000));
                response3 = await InstanceClient.getInstance(instanceId);

                if (response3.code !== StatusCode.OK) {
                    this.addError(response3.error);
                    this.setState({ moving: false });
                    await this.context.reloadInstance();
                    return;
                }
            } while (response3.payload.moveJob);

            const response4 = await InstanceClient.editInstance({
                online: true,
                id: instanceId
            });
            if (response4.code !== StatusCode.OK) {
                this.addError(response4.error);
                this.setState({ moving: false });
            } else {
                JobsController.registerJob(response2.payload.moveJob!, instanceId);
            }
        }

        await this.context.reloadInstance();
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

                {this.state.moving ? (
                    <Loading text="loading.instance.move" />
                ) : (
                    <InputForm fields={fields} onSave={this.editInstance} />
                )}
            </div>
        );
    }
}
InstanceSettings.contextType = InstanceEditContext;
export default withRouter(InstanceSettings);
