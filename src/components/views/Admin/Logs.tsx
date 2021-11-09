import React, { Component, CSSProperties } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage, FormattedRelativeTime } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";

import AdminClient from "../../../ApiClient/AdminClient";
import { LogFileResponse } from "../../../ApiClient/generatedcode/schemas";
import { DownloadedLog } from "../../../ApiClient/models/DownloadedLog";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { download } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import ErrorAlert from "../../utils/ErrorAlert";
import { DebugJsonViewer } from "../../utils/JsonViewer";
import Loading from "../../utils/Loading";
import PageHelper from "../../utils/PageHelper";

interface IProps extends RouteComponentProps<{ name: string | undefined }> {}

interface LogEntry {
    time: string;
    content: string;
}

interface Log {
    logFile: DownloadedLog;
    entries: LogEntry[];
}

interface IState {
    logs: LogFileResponse[];
    viewedLog?: Log;
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    page: number;
    maxPage?: number;
}

export default withRouter(
    class Logs extends Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.state = {
                errors: [],
                loading: true,
                logs: [],
                page: RouteData.loglistpage ?? 1
            };
        }

        public async componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
            if (prevState.page !== this.state.page) {
                RouteData.loglistpage = this.state.page;
                await this.loadLogs();
            }
        }

        public async componentDidMount(): Promise<void> {
            const param = this.props.match.params.name;
            if (param) {
                const res = await AdminClient.getLog(param);

                switch (res.code) {
                    case StatusCode.OK: {
                        const regex = RegExp(
                            /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{7}[-+]\d{2}:\d{2})\s+(.*?)(?=(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{7}[-+]\d{2}:\d{2}|$))/,
                            "gs"
                        );
                        let match;
                        const entries: LogEntry[] = [];
                        while ((match = regex.exec(res.payload.content)) !== null) {
                            entries.push({
                                time: match[1],
                                content: match[2]
                            });
                        }
                        this.setState({
                            viewedLog: {
                                logFile: res.payload,
                                entries: entries
                            }
                        });
                        break;
                    }
                    case StatusCode.ERROR: {
                        this.addError(res.error);
                        break;
                    }
                }
            }

            await this.loadLogs();
        }

        private async loadLogs(): Promise<void> {
            this.setState({
                loading: true
            });
            const response = await AdminClient.getLogs({ page: this.state.page });

            switch (response.code) {
                case StatusCode.OK: {
                    if (
                        this.state.page > response.payload.totalPages &&
                        response.payload.totalPages !== 0
                    ) {
                        this.setState({
                            page: 1
                        });
                        return;
                    }

                    this.setState({
                        logs: response.payload.content,
                        maxPage: response.payload.totalPages
                    });
                    break;
                }
                case StatusCode.ERROR: {
                    this.addError(response.error);
                    break;
                }
            }
            this.setState({
                loading: false
            });
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

        private async downloadLog(name: string): Promise<void> {
            const res = await AdminClient.getLog(name);
            switch (res.code) {
                case StatusCode.OK: {
                    download(name, res.payload.content);
                    break;
                }
                case StatusCode.ERROR: {
                    this.addError(res.error);
                    break;
                }
            }
        }

        public render(): React.ReactNode {
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
                    {this.state.loading ? (
                        <Loading text="loading.logs" />
                    ) : this.props.match.params.name && this.state.viewedLog ? (
                        <div className="mx-5 mt-5">
                            <DebugJsonViewer obj={this.state.viewedLog} />
                            <h3>{this.props.match.params.name}</h3>
                            <Button
                                className="mr-1"
                                as={Link}
                                to={AppRoutes.admin_logs.link ?? AppRoutes.admin_logs.route}>
                                <FormattedMessage id="generic.goback" />
                            </Button>
                            <Button
                                onClick={() => {
                                    download(
                                        this.props.match.params.name!,
                                        this.state.viewedLog!.logFile.content
                                    );
                                }}>
                                <FormattedMessage id="generic.download" />
                            </Button>
                            <hr />
                            <div
                                style={{
                                    height: "60vh",
                                    display: "block"
                                }}
                                className="table-responsive">
                                <Table striped hover variant="dark" className="text-left">
                                    <thead
                                        className="bg-dark"
                                        style={
                                            {
                                                position: "sticky",
                                                top: 0
                                            } as CSSProperties
                                        }>
                                        <th>
                                            <FormattedMessage id="generic.datetime" />
                                        </th>
                                        <th>
                                            <FormattedMessage id="generic.entry" />
                                        </th>
                                    </thead>
                                    <tbody>
                                        {this.state.viewedLog.entries.map(value => {
                                            return (
                                                <tr key={value.time}>
                                                    <td className="py-1">{value.time}</td>
                                                    <td className="py-1">
                                                        <pre className="mb-0">{value.content}</pre>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <Container className="mt-5 mb-5">
                            <DebugJsonViewer obj={this.state.logs} />
                            <Table striped bordered hover variant="dark" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>
                                            <FormattedMessage id="generic.name" />
                                        </th>
                                        <th>
                                            <FormattedMessage id="generic.datetime" />
                                        </th>
                                        <th>
                                            <FormattedMessage id="generic.action" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.logs.map((value, index) => {
                                        const logdate = new Date(value.lastModified);
                                        const logdiff = (logdate.getTime() - Date.now()) / 1000;

                                        return (
                                            <tr key={value.name}>
                                                <td>{index}</td>
                                                <td>{value.name}</td>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip id={`${value.name}-tooltip`}>
                                                            {logdate.toLocaleString()}
                                                        </Tooltip>
                                                    }>
                                                    {({ ref, ...triggerHandler }) => (
                                                        <td {...triggerHandler}>
                                                            <span
                                                                ref={
                                                                    ref as React.Ref<HTMLSpanElement>
                                                                }>
                                                                <FormattedRelativeTime
                                                                    value={logdiff}
                                                                    numeric="auto"
                                                                    updateIntervalInSeconds={1}
                                                                />
                                                            </span>
                                                        </td>
                                                    )}
                                                </OverlayTrigger>
                                                <td className="align-middle p-0">
                                                    <Button
                                                        className="mr-1"
                                                        onClick={() => {
                                                            this.props.history.push(
                                                                (AppRoutes.admin_logs.link ??
                                                                    AppRoutes.admin_logs.route) +
                                                                    value.name +
                                                                    "/",
                                                                {
                                                                    reload: true
                                                                }
                                                            );
                                                        }}>
                                                        <FormattedMessage id="generic.view" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            this.downloadLog(value.name).catch(
                                                                (e: Error) => {
                                                                    this.addError(
                                                                        new InternalError<ErrorCode.APP_FAIL>(
                                                                            ErrorCode.APP_FAIL,
                                                                            {
                                                                                jsError: e
                                                                            }
                                                                        )
                                                                    );
                                                                }
                                                            );
                                                        }}>
                                                        <FormattedMessage id="generic.download" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                            <PageHelper
                                selectPage={newPage => this.setState({ page: newPage })}
                                totalPages={this.state.maxPage ?? 1}
                                currentPage={this.state.page}
                            />
                        </Container>
                    )}
                </div>
            );
        }
    }
);
