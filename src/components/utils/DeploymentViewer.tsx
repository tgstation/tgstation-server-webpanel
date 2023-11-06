import {
    faCaretDown,
    faCaretRight,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import { Badge, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { lt as SemverLessThan } from "semver";

import { CompileJobResponse, DreamDaemonSecurity } from "../../ApiClient/generatedcode/generated";
import { InstanceEditContext } from "../../contexts/InstanceEditContext";
import { DebugJsonViewer } from "./JsonViewer";
import Loading from "./Loading";
import PageHelper from "./PageHelper";

export enum ViewDataType {
    CompileJobs,
    Watchdog
}

export interface CompileJobsPaging {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    loadPage: (page: number) => Promise<void>;
}

export interface DeploymentsData {
    viewDataType: ViewDataType;
    compileJobs?: CompileJobResponse[];
    paging: CompileJobsPaging;
}

export interface WatchdogData {
    viewDataType: ViewDataType;
    activeCompileJob?: CompileJobResponse | null;
    stagedCompileJob?: CompileJobResponse | null;
}

type CompileJobViewerData = WatchdogData | DeploymentsData;

interface IProps {
    viewData: CompileJobViewerData | null; // null means loading
}

interface IState {
    openTestMergesId: number | null;
}

class DeploymentViewer extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;
    public constructor(props: IProps) {
        super(props);

        this.state = {
            openTestMergesId: null
        };
    }

    public render(): ReactNode {
        return (
            <div>
                <DebugJsonViewer obj={this.props.viewData} />
                <h3 className="text-center">
                    <FormattedMessage id="view.instance.server.deployment_info" />
                </h3>
                {!this.props.viewData ? (
                    <Loading text="loading.compile_jobs" />
                ) : (
                    this.renderViewData(this.props.viewData)
                )}
            </div>
        );
    }
    /*
    <React.Fragment>
                        {this.props.viewData.viewDataType === ViewDataType.CompileJobs ? (
                            <PageHelper
                                className="mt-4"
                                selectPage={newPage => void this.props.paging.loadPage(newPage)}
                                totalPages={this.state.maxPage ?? 1}
                                currentPage={this.state.page}
                            />
                        ) : (
                            <React.Fragment />
                        )}
                    </React.Fragment>
    */

    private renderViewData(viewData: CompileJobViewerData): React.ReactNode {
        let noJobs = false;
        let renderFunc: () => React.ReactNode;
        const watchdogViewData = viewData as WatchdogData;
        const deploymentsViewData = viewData as DeploymentsData;
        switch (viewData.viewDataType) {
            case ViewDataType.Watchdog:
                noJobs = !watchdogViewData.activeCompileJob;
                renderFunc = () => this.renderWatchdog(watchdogViewData);
                break;
            case ViewDataType.CompileJobs:
                noJobs =
                    !!deploymentsViewData.compileJobs &&
                    deploymentsViewData.compileJobs.length === 0;
                renderFunc = () => this.renderDeployments(deploymentsViewData);
                break;
            default:
                throw new Error("Invalid enum value for ViewDataType!");
        }

        if (noJobs)
            return (
                <h1>
                    <Badge variant="warning">
                        <FormattedMessage id="view.utils.deployment_viewer.no_jobs" />
                    </Badge>
                </h1>
            );

        return renderFunc();
    }

    private renderTable(tableContents: React.ReactNode): React.ReactNode {
        return (
            <Table className="table table-hover">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.id" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.byond" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.started_at" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.completed_at" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.started_by" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.project" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.revision" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.origin" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.security" />
                        </th>
                        <th>
                            <FormattedMessage id="view.utils.deployment_viewer.table.dmapi" />
                        </th>
                    </tr>
                </thead>
                <tbody>{tableContents}</tbody>
            </Table>
        );
    }

    private renderWatchdog(viewData: WatchdogData): React.ReactNode {
        return this.renderTable(
            <React.Fragment>
                <tr>
                    <td colSpan={11}>
                        <h3>
                            <Badge pill variant="success">
                                <FormattedMessage id="view.instance.server.deployment_info.active" />
                            </Badge>
                        </h3>
                    </td>
                </tr>
                {this.renderCompileJob(viewData.activeCompileJob!)}
                {viewData.stagedCompileJob ? (
                    <React.Fragment>
                        <tr>
                            <td colSpan={11}>
                                <h3>
                                    <Badge pill variant="warning">
                                        <FormattedMessage id="view.instance.server.deployment_info.staged" />
                                    </Badge>
                                </h3>
                            </td>
                        </tr>
                        {this.renderCompileJob(viewData.stagedCompileJob)}
                    </React.Fragment>
                ) : (
                    <React.Fragment />
                )}
            </React.Fragment>
        );
    }
    private renderDeployments(viewData: DeploymentsData): React.ReactNode {
        return (
            <React.Fragment>
                {this.renderTable(
                    <React.Fragment>
                        {viewData.compileJobs!.map(compileJob => this.renderCompileJob(compileJob))}
                    </React.Fragment>
                )}
                <PageHelper
                    className="mt-4"
                    selectPage={newPage => void viewData.paging.loadPage(newPage)}
                    totalPages={viewData.paging.totalPages}
                    currentPage={viewData.paging.currentPage}
                />
            </React.Fragment>
        );
    }

    private renderCompileJob(compileJob: CompileJobResponse) {
        let correctedByondVersion = compileJob.byondVersion;
        if (correctedByondVersion.endsWith(".0"))
            correctedByondVersion = correctedByondVersion.substring(
                0,
                correctedByondVersion.length - 2
            );

        // we use en-GB so we get the fucking SANE DD/MM/YYYY
        const dateFormatter: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            year: "numeric",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZoneName: "short"
        };

        const hasTestMerges =
            compileJob.revisionInformation.activeTestMerges &&
            compileJob.revisionInformation.activeTestMerges.length > 0;
        const testMergesOpen = this.state.openTestMergesId === compileJob.id;

        const outOfDateDMApi =
            !compileJob.dmApiVersion ||
            SemverLessThan(compileJob.dmApiVersion, this.context?.serverInfo?.dmApiVersion);

        return (
            <React.Fragment>
                <tr
                    className="nowrap"
                    onClick={() => {
                        if (testMergesOpen) {
                            this.setState({
                                openTestMergesId: null
                            });
                        } else if (hasTestMerges) {
                            this.setState({
                                openTestMergesId: compileJob.id
                            });
                        }
                    }}>
                    <td>
                        {hasTestMerges ? (
                            <h5
                                style={{
                                    whiteSpace: "nowrap"
                                }}>
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip id={`${compileJob.id}-tooltip-test-merges`}>
                                            <FormattedMessage
                                                id={`view.utils.deployment_viewer.test_merges_hint.${
                                                    testMergesOpen ? "hide" : "show"
                                                }`}
                                            />
                                        </Tooltip>
                                    }>
                                    {({ ref, ...triggerHandler }) => (
                                        <span
                                            ref={ref as React.Ref<HTMLSpanElement>}
                                            {...triggerHandler}>
                                            <FontAwesomeIcon
                                                icon={testMergesOpen ? faCaretDown : faCaretRight}
                                            />
                                        </span>
                                    )}
                                </OverlayTrigger>
                            </h5>
                        ) : null}
                    </td>
                    <td>
                        {outOfDateDMApi ? (
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`${compileJob.id}-tooltip-dmapi`}>
                                        <FormattedMessage
                                            id="view.utils.deployment_viewer.dmapi_outdated"
                                            values={{
                                                codebase: compileJob.dmApiVersion ?? "N/A",
                                                tgs: this.context.serverInfo.dmApiVersion
                                            }}
                                        />
                                    </Tooltip>
                                }>
                                {({ ref, ...triggerHandler }) => (
                                    <Badge
                                        pill
                                        variant="danger"
                                        style={{
                                            cursor: "pointer"
                                        }}
                                        ref={ref as React.Ref<HTMLSpanElement>}
                                        {...triggerHandler}
                                        onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                                            window
                                                .open(
                                                    "https://github.com/tgstation/tgstation-server/releases?q=%23tgs-dmapi-release&expanded=true",
                                                    "_blank"
                                                )
                                                ?.focus();
                                            e.stopPropagation();
                                        }}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                    </Badge>
                                )}
                            </OverlayTrigger>
                        ) : null}
                    </td>
                    <td>{compileJob.id}</td>
                    <td>{correctedByondVersion}</td>
                    <td>
                        {new Date(compileJob.job.startedAt).toLocaleString("en-CA", dateFormatter)}
                    </td>
                    <td>
                        {new Date(compileJob.job.stoppedAt!).toLocaleString("en-CA", dateFormatter)}
                    </td>
                    <td>{compileJob.job.startedBy.name}</td>
                    <td>{compileJob.dmeName}</td>
                    <td>{compileJob.revisionInformation.commitSha.substring(0, 7)}</td>
                    <td>{compileJob.revisionInformation.originCommitSha.substring(0, 7)}</td>
                    <td>
                        {compileJob.minimumSecurityLevel != null ? (
                            Object.keys(DreamDaemonSecurity).filter(v => isNaN(Number(v)))[
                                compileJob.minimumSecurityLevel
                            ]
                        ) : (
                            <i>
                                <FormattedMessage id="generic.not_applicable" />
                            </i>
                        )}
                    </td>
                    <td>{compileJob.dmApiVersion}</td>
                </tr>
                {testMergesOpen ? (
                    <tr>
                        <td colSpan={10}>
                            <Table>
                                <thead>
                                    <th>
                                        <FormattedMessage id="view.utils.deployment_viewer.table.pr.number" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="view.utils.deployment_viewer.table.pr.title" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="view.utils.deployment_viewer.table.revision" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="view.utils.deployment_viewer.table.pr.merged_by" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="view.utils.deployment_viewer.table.pr.merged_at" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="view.utils.deployment_viewer.table.pr.comment" />
                                    </th>
                                </thead>
                                <tbody>
                                    {compileJob.revisionInformation.activeTestMerges.map(
                                        testMerge => (
                                            <tr
                                                key={`test-merge-#${testMerge.number}-cj-${compileJob.id}`}>
                                                <td>
                                                    <a href={testMerge.url}>#{testMerge.number}</a>
                                                </td>
                                                <td>
                                                    <a href={testMerge.url}>
                                                        {testMerge.titleAtMerge}
                                                    </a>
                                                </td>
                                                <td>{testMerge.targetCommitSha.substring(0, 7)}</td>
                                                <td>{testMerge.mergedBy.name}</td>
                                                <td>
                                                    {new Date(testMerge.mergedAt).toLocaleString(
                                                        "en-CA",
                                                        dateFormatter
                                                    )}
                                                </td>
                                                <td>
                                                    {testMerge.comment ? (
                                                        testMerge.comment
                                                    ) : (
                                                        <i>
                                                            <FormattedMessage id="generic.not_applicable" />
                                                        </i>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </Table>
                        </td>
                    </tr>
                ) : (
                    <React.Fragment />
                )}
            </React.Fragment>
        );
    }
}

DeploymentViewer.contextType = InstanceEditContext;
export default DeploymentViewer;
