import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import ErrorAlert from "../../../utils/ErrorAlert";
import Loading from "../../../utils/Loading";

interface IProps extends RouteComponentProps {
    instance: Components.Schemas.Instance;
    loadInstance: () => unknown;
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

        public render(): React.ReactNode {
            if (this.state.loading) {
                return <Loading text="loading.instance" />;
            }

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
                    hey!
                    {JSON.stringify(this.props.instance)}
                    <a onClick={() => this.props.loadInstance()}>Test</a>
                </div>
            );
        }
    }
);
