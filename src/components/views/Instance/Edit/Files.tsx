import React, { Fragment } from "react";

import ConfigurationFileClient from "../../../../ApiClient/ConfigurationFileClient";
import {
    ConfigurationFileResponse,
    ConfigurationRights,
    ConfigurationType
} from "../../../../ApiClient/generatedcode/generated";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasFilesRight } from "../../../../utils/misc";
import { RouteData } from "../../../../utils/routes";
import Loading from "../../../utils/Loading";

interface IProps {}

class DirectoryTree {
    public children: DirectoryTree[];
    public fileResponse: ConfigurationFileResponse;
    public page = 0;
    public totalFiles: number | undefined;
    public fullyLoaded = false;
    public totalPages = 0;
    public fileContents: string | undefined;

    public constructor(fileResponse: ConfigurationFileResponse) {
        this.fileResponse = fileResponse;
        if (!fileResponse.isDirectory) this.fullyLoaded = true;
        this.children = [];
    }
}

interface IState {
    rootDirectory: DirectoryTree[];
    page: number;
    maxPage?: number;
    loading: boolean;
    selectedFile?: DirectoryTree;
}

class Files extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            rootDirectory: [],
            page: RouteData.rootDirectoryPage ?? 1,
            loading: true
        };
    }

    public async componentDidUpdate(
        prevProps: Readonly<IProps>,
        prevState: Readonly<IState>
    ): Promise<void> {
        if (prevState.page !== this.state.page) {
            RouteData.byondlistpage = this.state.page;
            await this.loadRootDir();
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.loadRootDir();

        this.setState({ loading: false });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance" />;
        }

        const instanceConfigMode = this.context.instance.configurationType;

        if (instanceConfigMode === ConfigurationType.Disallowed) {
            return <div>Instance Configuration Type prevents viewing files.</div>;
        }

        const canSeeFiles = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.List
        );

        if (!canSeeFiles) {
            return <div>get some permissions scrub</div>;
        }

        const canReadFiles = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.Read
        );

        const canWriteFiles = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.Write
        );

        return (
            <div className="d-flex flex-row">
                <div>
                    <ul>
                        {this.state.rootDirectory.map(dir => (
                            <Fragment key={dir.fileResponse.path}>{this.directory(dir)}</Fragment>
                        ))}
                    </ul>
                </div>
                <div className="flex-fill flex-column">
                    {!canReadFiles ? (
                        <span>No file read permissions</span>
                    ) : (
                        <textarea
                            cols={80}
                            rows={30}
                            className="ml-16"
                            value={this.state.selectedFile?.fileContents}
                            disabled={!canWriteFiles}
                        />
                    )}
                </div>
            </div>
        );
    }

    private selectFile(dir: DirectoryTree) {
        this.setState({ selectedFile: dir });
        if (!dir.fileContents) {
            void this.loadFileContents(dir);
        }
    }

    private async loadFileContents(dir: DirectoryTree) {
        if (dir.fileResponse.isDirectory) return;
        if (hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.Read)) {
            const response = await ConfigurationFileClient.getConfigFile(
                this.context.instance.id,
                dir.fileResponse.path
            );

            if (response.code === StatusCode.OK) {
                dir.fileContents = response.payload.content;
                this.setState({ selectedFile: dir });
                this.forceUpdate();
            }
        }
    }

    private loadMore(dir: DirectoryTree) {
        void this.loadDirectory(dir).then(() => {
            this.forceUpdate();
        });
    }

    private directory(dir: DirectoryTree): React.ReactNode {
        const canReadFiles = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.Read
        );

        const index = Math.max(
            dir.fileResponse.path.lastIndexOf("\\"),
            dir.fileResponse.path.lastIndexOf("/")
        );
        if (!dir.fileResponse.isDirectory) {
            return (
                <li>
                    <a onClick={() => (canReadFiles ? this.selectFile(dir) : {})}>
                        {dir.fileResponse.path.slice(index + 1)}
                    </a>
                </li>
            );
        }
        return (
            <>
                <li>{dir.fileResponse.path.slice(index + 1)}</li>
                <ul>
                    {dir.children.map(c => (
                        <Fragment key={c.fileResponse.path}>{this.directory(c)}</Fragment>
                    ))}
                    {!dir.fullyLoaded ? (
                        <li
                            onClick={() => {
                                this.loadMore(dir);
                            }}>
                            Load More
                        </li>
                    ) : (
                        ""
                    )}
                </ul>
            </>
        );
    }

    private async loadRootDir() {
        if (hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.List)) {
            const response = await ConfigurationFileClient.getRootDirectory(
                this.context.instance.id,
                {
                    page: this.state.page
                }
            );

            if (response.code === StatusCode.OK) {
                if (
                    this.state.page > response.payload.totalPages &&
                    response.payload.totalPages !== 0
                ) {
                    this.setState({
                        page: 1
                    });
                    return;
                }

                const rootDirectory = response.payload.content.map(r => new DirectoryTree(r));

                for (const rd of rootDirectory) {
                    if (rd.fileResponse.isDirectory) await this.loadDirectory(rd);
                }

                this.setState({
                    rootDirectory: rootDirectory,
                    maxPage: response.payload.totalPages
                });
            }
        }
    }

    private async loadDirectory(directory: DirectoryTree) {
        if (hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.List)) {
            if (directory.fullyLoaded) {
                // reload the directory
                directory.fullyLoaded = false;
                directory.page = 0;
                directory.children = [];
            }
            directory.page++;
            const path =
                directory.fileResponse.path[0] === "\\" || directory.fileResponse.path[0] === "/"
                    ? directory.fileResponse.path.slice(1)
                    : directory.fileResponse.path;
            const response = await ConfigurationFileClient.getDirectory(
                this.context.instance.id,
                path,
                {
                    page: directory.page
                }
            );
            if (response.code === StatusCode.OK) {
                directory.totalPages = response.payload.totalPages;
                if (response.payload.totalPages <= directory.page) directory.fullyLoaded = true;
                const newChildren = response.payload.content.map(c => new DirectoryTree(c));
                for (const c of newChildren) {
                    directory.children.push(c);
                    if (c.fileResponse.isDirectory) await this.loadDirectory(c);
                }
            }
        }
    }
}

Files.contextType = InstanceEditContext;
export default Files;
