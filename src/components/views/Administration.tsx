import React from 'react';
import AccessDenied from '../utils/AccessDenied';
import { AppRoutes } from '../../utils/routes';
import InternalError from '../../models/InternalComms/InternalError';
import AdminClient, { AdminInfoErrors } from '../../clients/AdminClient';
import { StatusCode } from '../../models/InternalComms/InternalStatus';
import Loading from '../utils/Loading';
import ErrorAlert from '../utils/ErrorAlert';
import { Components } from '../../clients/_generated';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ServerClient from '../../clients/ServerClient';
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows';
import { faLinux } from '@fortawesome/free-brands-svg-icons/faLinux';

interface IProps {}
interface IState {
    adminInfo?: Components.Schemas.Administration;
    serverInfo?: Components.Schemas.ServerInformation;
    error?: InternalError<AdminInfoErrors>;
    busy: boolean;
}

export default class Administration extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            busy: false
        };
    }

    public async componentDidMount() {
        this.setState({
            busy: true
        });
        const tasks = [];

        console.time('DataLoad');
        tasks.push(this.loadAdminInfo());
        tasks.push(this.loadServerInfo());

        await Promise.all(tasks);
        console.timeEnd('DataLoad');
        this.setState({
            busy: false
        });
    }

    private async loadServerInfo() {
        console.time('ServerLoad');
        const response = await ServerClient.getServerInfo();
        switch (response.code) {
            case StatusCode.ERROR: {
                this.setState({
                    error: response.error
                });
                break;
            }
            case StatusCode.OK: {
                this.setState({
                    serverInfo: response.payload
                });
                break;
            }
        }
        console.timeEnd('ServerLoad');
    }

    private async loadAdminInfo() {
        console.time('AdminLoad');
        const response = await AdminClient.getAdminInfo();
        switch (response.code) {
            case StatusCode.ERROR: {
                this.setState({
                    error: response.error
                });
                break;
            }
            case StatusCode.OK: {
                this.setState({
                    adminInfo: response.payload
                });
                break;
            }
        }
        console.timeEnd('AdminLoad');
    }

    public render() {
        if (this.state.busy) {
            return <Loading />;
        }
        // @ts-ignore
        return (
            <React.Fragment>
                <AccessDenied currentRoute={AppRoutes.admin} />
                <ErrorAlert
                    error={this.state.error}
                    onClose={() => this.setState({ error: undefined })}
                />
                {this.state.adminInfo && this.state.serverInfo ? (
                    <React.Fragment>
                        <h3 className="text-center text-secondary">
                            Host Machine OS:{' '}
                            <FontAwesomeIcon
                                fixedWidth
                                //@ts-ignore //it works on my machine, idk, typescript hates this for some reason
                                icon={this.state.adminInfo.windowsHost ? faWindows : faLinux}
                            />
                        </h3>
                        <h5 className="text-center text-secondary">
                            Remote repository:{' '}
                            <a href={this.state.adminInfo.trackedRepositoryUrl!}>
                                {this.state.adminInfo.trackedRepositoryUrl!}
                            </a>
                        </h5>
                        <h3 className="text-center text-secondary">
                            Current version:{' '}
                            <span
                                className={
                                    this.state.serverInfo.version! <
                                    this.state.adminInfo.latestVersion!
                                        ? 'text-danger'
                                        : ''
                                }>
                                {this.state.serverInfo.version!}
                            </span>
                        </h3>
                        <h3 className="text-center text-secondary">
                            Latest version:{' '}
                            <span
                                className={
                                    this.state.serverInfo.version! <
                                    this.state.adminInfo.latestVersion!
                                        ? 'text-danger'
                                        : ''
                                }>
                                {this.state.adminInfo.latestVersion!}
                            </span>
                        </h3>
                    </React.Fragment>
                ) : (
                    ''
                )}
            </React.Fragment>
        );
    }
}
