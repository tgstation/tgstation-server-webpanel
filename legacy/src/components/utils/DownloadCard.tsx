import * as React from "react";
import { Alert, Collapse, ProgressBar } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

import { ProgressEvent } from "../../ApiClient/TransferClient";

export interface IDownloadProps {
    filename: string;
    progress: ProgressEvent;
    onClose: () => void;
}

interface IState {
    animatedOpen: boolean;
    closeTriggered: boolean;
}

export class DownloadCard extends React.Component<IDownloadProps, IState> {
    public constructor(props: IDownloadProps) {
        super(props);
        this.state = {
            animatedOpen: false,
            closeTriggered: false
        };
    }

    public componentDidMount(): void {
        this.setState({
            animatedOpen: true
        });

        if (this.isCompleted()) {
            this.close();
        }
    }

    public componentDidUpdate(): void {
        if (this.isCompleted()) {
            this.close();
        }
    }

    private isCompleted(props?: Readonly<IDownloadProps>): boolean {
        props ??= this.props;
        const completed =
            props.progress.loaded === props.progress.total || props.progress.total === 0;
        return completed;
    }

    private close(): void {
        if (this.state.closeTriggered) {
            return;
        }
        this.setState({
            closeTriggered: true
        });

        setTimeout(() => {
            this.setState({
                animatedOpen: false
            });
            setTimeout(this.props.onClose, 1000);
        }, 3000);
    }

    public render(): React.ReactNode {
        const completed =
            this.props.progress.loaded === this.props.progress.total ||
            this.props.progress.total === 0;
        return (
            <Collapse in={this.state.animatedOpen} dimension="height">
                <div>
                    <Alert
                        className="clearfix"
                        variant={completed ? "success" : "primary"}
                        transition>
                        <FormattedMessage
                            id={completed ? "generic.downloaded" : "generic.downloading"}
                            values={{ file: this.props.filename }}
                        />
                        <hr />
                        <ProgressBar
                            min={0}
                            now={Math.max(1, this.props.progress.loaded)}
                            max={Math.max(1, this.props.progress.total ?? 1)}
                            variant={completed ? "success" : "warning"}
                            animated={!completed}
                        />
                    </Alert>
                </div>
            </Collapse>
        );
    }
}
