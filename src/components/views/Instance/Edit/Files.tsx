import React from "react";

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

        return (
            <div>
                <ul>{this.state.rootDirectory.map(dir => this.directory(dir))}</ul>
                <div>{JSON.stringify(this.state.rootDirectory)}</div>
            </div>
        );
    }

    private loadMore(dir: DirectoryTree) {
        void this.loadDirectory(dir).then(() => {
            this.forceUpdate();
        });
    }

    private directory(dir: DirectoryTree): React.ReactNode {
        const index = Math.max(
            dir.fileResponse.path.lastIndexOf("\\"),
            dir.fileResponse.path.lastIndexOf("/")
        );
        if (!dir.fileResponse.isDirectory) {
            return <li>{dir.fileResponse.path.slice(index + 1)}</li>;
        }
        return (
            <>
                <li>{dir.fileResponse.path.slice(index + 1)}</li>
                <ul>
                    {dir.children.map(c => this.directory(c))}
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

                console.log(rootDirectory);

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
            console.log(directory.fileResponse.path);
            console.log(path);
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
