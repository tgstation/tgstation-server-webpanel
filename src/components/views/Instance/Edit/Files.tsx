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
                <div style={{ paddingRight: "16px", maxHeight: "800px", overflowY: "scroll" }}>
                    <ul>
                        {this.state.rootDirectory.map(dir => (
                            <Fragment key={dir.fileResponse.path}>{this.directory(dir)}</Fragment>
                        ))}
                    </ul>
                </div>
                <div className="flex-fill flex-column" style={{ padding: "16px" }}>
                    {!canReadFiles ? (
                        <span>No file read permissions</span>
                    ) : !this.state.selectedFile ? (
                        <span>Select a file on the left</span>
                    ) : (
                        <>
                            <textarea
                                cols={80}
                                style={{ height: "100%" }}
                                value={this.state.selectedFile.fileContents}
                                disabled={!canWriteFiles}
                            />
                            {canWriteFiles && this.state.selectedFile?.fileContents ? (
                                <button
                                    onClick={() =>
                                        this.saveFile(
                                            this.state.selectedFile?.fileContents as string
                                        )
                                    }>
                                    Save
                                </button>
                            ) : (
                                ""
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    private async saveFile(contents: string) {
        if (!this.state.selectedFile) return;
        if (hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.Write)) {
            const response = await ConfigurationFileClient.writeConfigFile(
                this.context.instance.id,
                { path: this.state.selectedFile.fileResponse.path },
                new TextEncoder().encode(contents)
            );

            if (response.code === StatusCode.OK) {
                await this.loadFileContents(this.state.selectedFile);
            }
        }
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

        console.log(dir.fileResponse.path);

        const index = Math.max(
            dir.fileResponse.path.lastIndexOf("\\"),
            dir.fileResponse.path.lastIndexOf("/")
        );
        if (!dir.fileResponse.isDirectory) {
            const selected = dir.fileResponse.path === this.state.selectedFile?.fileResponse.path;
            return (
                <li
                    style={{
                        fontWeight: selected ? "bold" : "normal",
                        borderColor: "white",
                        paddingLeft: selected ? "4px" : "0",
                        borderLeftStyle: selected ? "solid" : "none",
                        borderTopStyle: selected ? "solid" : "none",
                        borderBottomStyle: selected ? "solid" : "none"
                    }}>
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

                console.log("getting root directory");
                response.payload.content.map(r => console.log(r.path));

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
                console.log("getting specific directory " + path);
                response.payload.content.forEach(c => console.log(c.path));

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
