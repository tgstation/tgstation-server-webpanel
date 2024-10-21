import {
    faDownload,
    faFile,
    faFileAlt,
    faFolderMinus,
    faFolderPlus,
    faTimes
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { downloadZip } from "client-zip";
import React from "react";
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

import ConfigurationFileClient from "../../../../ApiClient/ConfigurationFileClient";
import {
    ConfigurationFileResponse,
    ConfigurationRights,
    ConfigurationType
} from "../../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import TransferClient, { ProgressEvent } from "../../../../ApiClient/TransferClient";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasFilesRight } from "../../../../utils/misc";
import { DownloadCard, IDownloadProps } from "../../../utils/DownloadCard";
import ErrorAlert from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import WIPNotice from "../../../utils/WIPNotice";

// https://stackoverflow.com/questions/24007073/open-links-made-by-createobjecturl-in-ie11/45732897#45732897
const downloadFileUsingBlob = (fileName: string, fileData: Blob) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const unknownNav = window.navigator as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (unknownNav && unknownNav.msSaveOrOpenBlob) {
        // for IE
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        unknownNav.msSaveOrOpenBlob(fileData, fileName);
    } else {
        // for Non-IE (chrome, firefox etc.)
        const a = document.createElement("a");
        document.body.appendChild(a);
        const fileUrl = URL.createObjectURL(fileData);
        a.href = fileUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
    }
};

interface CreateEntitySettings {
    entityName: string;
    isDirectory: boolean;
    replace?: boolean;
}

class DirectoryTree {
    public parent: DirectoryTree | null;
    public children: DirectoryTree[];
    public fileResponse: ConfigurationFileResponse;
    public totalFiles: number | undefined;
    public fullyLoaded = false;

    public constructor(fileResponse: ConfigurationFileResponse, parent?: DirectoryTree) {
        this.fileResponse = fileResponse;
        this.parent = parent ?? null;
        if (!fileResponse.isDirectory) this.fullyLoaded = true;
        this.children = [];
    }
}

type IProps = WrappedComponentProps;

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    rootDirectory: DirectoryTree | null;
    loading: boolean;
    selectedFile: DirectoryTree | null;
    selectedCreateNode: DirectoryTree | null;
    downloads: (IDownloadProps | null)[];
}

class Files extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            rootDirectory: null,
            loading: true,
            selectedFile: null,
            selectedCreateNode: null,
            downloads: []
        };

        this.createEntity = this.createEntity.bind(this);
        this.selectFile = this.selectFile.bind(this);
        this.shortAsyncAction = this.shortAsyncAction.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.loadDirectory = this.loadDirectory.bind(this);
        this.clearDirectory = this.clearDirectory.bind(this);
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

    public componentDidMount(): void {
        void this.loadRootDir();
    }

    private async loadRootDir() {
        if (hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.List)) {
            this.setState({
                loading: true
            });
            const mockResponse = {
                path: "/",
                isDirectory: true,
                fileTicket: ""
            };
            const rootDirectory = new DirectoryTree(mockResponse);
            await this.loadDirectory(rootDirectory);

            this.setState({
                rootDirectory: rootDirectory,
                loading: false
            });
        } else {
            this.setState({
                loading: false
            });
        }
    }

    private async shortAsyncAction(action: () => Promise<void>): Promise<void> {
        const actionPromise = action();

        // only set state to loading if it's taking more than 750ms
        let tookTooLong = false;
        const tooLongPromise = new Promise(r => setTimeout(r, 750)).then(() => {
            tookTooLong = true;
        });

        await Promise.race([actionPromise, tooLongPromise]);

        if (tookTooLong) {
            this.setState({
                loading: true
            });

            await actionPromise;

            this.setState({
                loading: false
            });
        } else this.forceUpdate();
    }

    private async deleteDirectory(dir: DirectoryTree): Promise<void> {
        const response = await ConfigurationFileClient.deleteDirectory(this.context.instance.id, {
            path: dir.fileResponse.path
        });

        if (response.code === StatusCode.OK) {
            if (dir.parent != null) {
                const parentIndex = dir.parent.children.indexOf(dir);
                dir.parent.children.splice(parentIndex, 1);
                this.forceUpdate();
            }
        } else {
            this.addError(response.error);
        }
    }

    private async loadDirectory(directory: DirectoryTree): Promise<void> {
        if (hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.List)) {
            this.clearDirectory(directory);

            const path =
                directory.fileResponse.path[0] === "\\" || directory.fileResponse.path[0] === "/"
                    ? directory.fileResponse.path.slice(1)
                    : directory.fileResponse.path;
            let maxPages = 1;
            for (let page = 1; page <= maxPages; ++page) {
                const response = await ConfigurationFileClient.getDirectory(
                    this.context.instance.id,
                    path,
                    {
                        page
                    }
                );
                if (response.code === StatusCode.OK) {
                    maxPages = response.payload.totalPages;
                    if (maxPages <= page) directory.fullyLoaded = true;
                    const newChildren = response.payload.content.map(
                        c => new DirectoryTree(c, directory)
                    );
                    for (const c of newChildren) {
                        directory.children.push(c);
                    }
                } else {
                    this.addError(response.error);
                    break;
                }
            }
        }
    }

    private async selectFile(file: DirectoryTree): Promise<void> {
        if (this.state.selectedFile === file) {
            this.setState({
                selectedFile: null
            });
            return;
        }

        let doctoredPath = file.fileResponse.path;
        while (doctoredPath.startsWith("/")) doctoredPath = doctoredPath.substring(1);

        if (!file.fileResponse.isDirectory) {
            const response = await ConfigurationFileClient.getConfigFile(
                this.context.instance.id,
                doctoredPath,
                null
            );

            const success = response.code === StatusCode.OK;
            if (success) {
                file.fileResponse = response.payload;
            } else {
                this.addError(response.error);
                file.fileResponse.lastReadHash = null;
            }
        }

        this.setState({
            selectedFile: file,
            selectedCreateNode: null
        });
    }

    private async deleteFile(): Promise<void> {
        const selectedFile = this.state.selectedFile!;
        const response = await ConfigurationFileClient.writeConfigFile(
            this.context.instance.id,
            {
                path: selectedFile.fileResponse.path,
                lastReadHash: selectedFile.fileResponse.lastReadHash
            },
            new Uint8Array()
        );

        if (response.code === StatusCode.OK) {
            const parentDirectory = selectedFile.parent!;
            const parentIndex = parentDirectory.children.indexOf(selectedFile);
            parentDirectory.children.splice(parentIndex, 1);
            this.setState({
                selectedFile: null
            });
        } else this.addError(response.error);
    }

    private async downloadDirectory(directory: DirectoryTree): Promise<void> {
        if (
            !confirm(
                this.props.intl.formatMessage(
                    { id: "view.instance.files.zip.confirm" },
                    { path: directory.fileResponse.path }
                )
            )
        ) {
            return;
        }
        this.setState({
            loading: true
        });

        const enumerateDirectory = async (
            dir: ConfigurationFileResponse
        ): Promise<ConfigurationFileResponse[] | null> => {
            let children: ConfigurationFileResponse[] = [];
            let maxPages = 1;

            const path = dir.path[0] === "\\" || dir.path[0] === "/" ? dir.path.slice(1) : dir.path;
            for (let page = 1; page <= maxPages; ++page) {
                const directoryResponse = await ConfigurationFileClient.getDirectory(
                    this.context.instance.id,
                    path,
                    {
                        page
                    }
                );
                if (directoryResponse.code === StatusCode.OK) {
                    maxPages = directoryResponse.payload.totalPages;
                    children = children.concat(directoryResponse.payload.content);
                } else {
                    this.addError(directoryResponse.error);
                    return null;
                }
            }

            return children;
        };

        let errorEncountered = false;
        const downloadSingleFile = async (
            file: ConfigurationFileResponse
        ): Promise<() => Promise<File | null>> => {
            const fileResponse = await ConfigurationFileClient.getConfigFile(
                this.context.instance.id,
                file.path,
                null
            );

            const pathInZip = file.path.substring(directory.fileResponse.path.length);
            if (fileResponse.code === StatusCode.OK) {
                const phase2 = async (): Promise<File | null> => {
                    const contents = await TransferClient.Download(
                        fileResponse.payload.fileTicket,
                        this.allocateDownload(pathInZip)
                    );

                    if (contents.code != StatusCode.OK) {
                        this.addError(contents.error);
                        return null;
                    }

                    const download = contents.payload;
                    const file = new File([download], pathInZip);
                    return file;
                };

                return phase2;
            }

            this.addError(fileResponse.error);
            errorEncountered = true;
            return () => Promise.resolve(null);
        };

        let directoriesToEnumerate: ConfigurationFileResponse[] = [directory.fileResponse];

        const fileDownloads: Promise<File | null>[] = [];

        while (directoriesToEnumerate.length > 0) {
            const tasks: Promise<ConfigurationFileResponse[] | null>[] = [];
            for (const directory of directoriesToEnumerate) {
                const task = enumerateDirectory(directory);
                await task;
                tasks.push(task);
            }

            directoriesToEnumerate = [];

            if (errorEncountered) {
                this.setState({
                    loading: false
                });
                return;
            }

            for (const task of tasks) {
                const dirInfo = await task;
                if (dirInfo == null) {
                    this.setState({
                        loading: false
                    });
                    return;
                }

                for (const directoryEntry of dirInfo) {
                    if (directoryEntry.isDirectory) {
                        directoriesToEnumerate.push(directoryEntry);
                    } else {
                        const innerPromiseFunc = await downloadSingleFile(directoryEntry);
                        fileDownloads.push(innerPromiseFunc());
                    }
                }
            }
        }

        await Promise.all(fileDownloads);
        if (errorEncountered) {
            this.setState({
                loading: false
            });
            return;
        }

        const downloadFiles: File[] = [];
        for (const fileDownload of fileDownloads) {
            downloadFiles.push((await fileDownload)!);
        }

        const zipBlob = await downloadZip(downloadFiles).blob();

        const index = Math.max(
            directory.fileResponse.path.lastIndexOf("\\"),
            directory.fileResponse.path.lastIndexOf("/")
        );

        const fileName = directory.fileResponse.path.slice(index + 1) + ".zip";
        downloadFileUsingBlob(fileName, zipBlob);

        this.setState({
            loading: false
        });
    }

    private async downloadFile(): Promise<void> {
        this.setState({
            loading: true
        });

        const selectedFile = this.state.selectedFile!;
        const index = Math.max(
            selectedFile.fileResponse.path.lastIndexOf("\\"),
            selectedFile.fileResponse.path.lastIndexOf("/")
        );
        const fileName = selectedFile.fileResponse.path.slice(index + 1);
        const response = await ConfigurationFileClient.getConfigFile(
            this.context.instance.id,
            selectedFile.fileResponse.path,
            this.allocateDownload(fileName)
        );

        if (response.code === StatusCode.OK) {
            downloadFileUsingBlob(fileName, response.payload.content!);
        } else this.addError(response.error);

        this.setState({
            loading: false
        });
    }

    private async createEntity(
        settings: CreateEntitySettings,
        parent: DirectoryTree
    ): Promise<void> {
        let fileData: ArrayBuffer;
        if (settings.isDirectory) {
            fileData = new Uint8Array();
        } else {
            const inputPromise = new Promise<File | null>(resolve => {
                const input = document.createElement("input");
                input.type = "file";
                input.onchange = e => {
                    const files = (e.target as HTMLInputElement)?.files;
                    if (files) resolve(files[0]);
                    else resolve(null);
                };
                input.click();
            });

            const localFile = await inputPromise;
            if (!localFile) return;

            // https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
            fileData = await localFile.arrayBuffer();
        }

        this.setState({ loading: true });

        let remoteFilePath = parent.fileResponse.path;
        if (!settings.replace) remoteFilePath += "/" + settings.entityName;
        else remoteFilePath = "/" + remoteFilePath;
        if (remoteFilePath.startsWith("//")) remoteFilePath = remoteFilePath.substring(1);
        if (settings.isDirectory) remoteFilePath += "/webpanel.dir.create.tmp";

        const response = await ConfigurationFileClient.writeConfigFile(
            this.context.instance.id,
            {
                path: remoteFilePath,
                lastReadHash: settings.replace ? parent.fileResponse.lastReadHash : null
            },
            fileData
        );

        if (response.code !== StatusCode.OK) {
            this.addError(response.error);
        } else if (settings.replace) {
            parent.fileResponse = response.payload;
        }

        if (!settings.replace) {
            parent.fullyLoaded = false;
            await this.loadDirectory(parent);
        }

        let normalizedRemotePath = remoteFilePath.replace("\\", "/");
        if (normalizedRemotePath.startsWith("/"))
            normalizedRemotePath = normalizedRemotePath.substring(1);
        const newFileNode =
            parent.children.find(child =>
                normalizedRemotePath.startsWith(child.fileResponse.path.replace("\\", "/"))
            ) ?? null;

        if (newFileNode)
            if (settings.isDirectory) {
                await this.loadDirectory(newFileNode);
                this.setState({
                    selectedCreateNode: null,
                    selectedFile: null
                });
            } else await this.selectFile(newFileNode);

        this.setState({
            loading: false
        });
    }

    private clearDirectory(directory: DirectoryTree): void {
        // reload the directory
        directory.fullyLoaded = false;
        directory.children.forEach(child => {
            if (child === this.state.selectedFile)
                this.setState({
                    selectedFile: null
                });
            else if (child === this.state.selectedCreateNode)
                this.setState({
                    selectedCreateNode: null
                });
            if (child.fileResponse.isDirectory) this.clearDirectory(child);
        });

        directory.children = [];
    }

    private allocateDownload(filename: string) {
        const indexPromise = new Promise<number>(resolve => {
            this.setState(prevState => {
                const newDownloads = [...prevState.downloads];
                resolve(newDownloads.push(null) - 1);
                return {
                    downloads: newDownloads
                };
            });
        });
        let latest = 0;
        return (progress: ProgressEvent) => {
            const ticket = ++latest;
            void indexPromise.then(index => {
                if (latest !== ticket) {
                    return;
                }

                this.setState(prevState => {
                    const newDownloads = [...prevState.downloads];
                    newDownloads[index] = {
                        filename,
                        progress,
                        onClose: () => {
                            this.setState(prevState => {
                                const newDownloads = [...prevState.downloads];
                                newDownloads[index] = null;
                                return {
                                    downloads: newDownloads
                                };
                            });
                        }
                    };
                    return {
                        downloads: newDownloads
                    };
                });
            });
        };
    }

    public render(): React.ReactNode {
        const downloadsFragment = (
            <React.Fragment>
                {this.state.downloads.map((download, index) => {
                    if (!download) return;
                    return <DownloadCard key={index} {...download} />;
                })}
            </React.Fragment>
        );

        if (this.state.loading) {
            return (
                <React.Fragment>
                    {downloadsFragment}
                    <Loading text="loading.instance.files" />
                </React.Fragment>
            );
        }

        const instanceConfigMode = this.context.instance.configurationType;

        if (instanceConfigMode === ConfigurationType.Disallowed) {
            return (
                <div className="text-center">
                    <GenericAlert title="view.instance.files.disallowed" />
                </div>
            );
        }

        const canListDirectories = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.List
        );

        const canWrite = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.Write
        );

        return (
            <div>
                <DebugJsonViewer obj={this.state} />
                <h2 className="text-center">
                    <FormattedMessage id="view.instance.files.file_browser" />
                </h2>
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
                {downloadsFragment}
                <div className="d-flex flex-row">
                    {canListDirectories ? (
                        <div
                            className="text-left"
                            style={{
                                paddingRight: "16px",
                                maxHeight: "800px",
                                minWidth: "200px",
                                overflowY: "scroll"
                            }}>
                            {this.renderDirectory(this.state.rootDirectory!)}
                        </div>
                    ) : (
                        <div
                            style={{
                                maxWidth: "200px"
                            }}>
                            <GenericAlert title="view.instance.files.disallowed.directory" />
                        </div>
                    )}
                    <div
                        className="flex-fill flex-column text-center align-self-center"
                        style={{ padding: "16px" }}>
                        {!canWrite ? (
                            <GenericAlert title="view.instance.files.disallowed.write" />
                        ) : (
                            <React.Fragment />
                        )}
                        {this.state.selectedCreateNode ? (
                            this.renderCreate()
                        ) : this.state.selectedFile ? (
                            this.renderSelectedFile()
                        ) : canListDirectories ? (
                            <h4>
                                <FormattedMessage id="view.instance.files.select_item" />
                            </h4>
                        ) : (
                            this.renderBrowserlessForms()
                        )}
                    </div>
                </div>
            </div>
        );
    }

    private renderDirectory(dir: DirectoryTree): React.ReactNode {
        const index = Math.max(
            dir.fileResponse.path.lastIndexOf("\\"),
            dir.fileResponse.path.lastIndexOf("/")
        );
        const selected = dir === this.state.selectedFile;
        if (!dir.fileResponse.isDirectory) {
            const fileName = dir.fileResponse.path.slice(index + 1);
            return (
                <li className="browser-li">
                    <Button
                        variant={selected ? "secondary" : "primary"}
                        onClick={() => void this.shortAsyncAction(() => this.selectFile(dir))}
                        className="nowrap">
                        <FontAwesomeIcon icon={faFileAlt} />
                        &nbsp;{fileName}
                    </Button>
                </li>
            );
        }

        const directoryName =
            dir == this.state.rootDirectory
                ? "Configuration"
                : dir.fileResponse.path.slice(index + 1);

        return (
            <div className="mb-2">
                <ButtonGroup>
                    <Button
                        variant={!dir.fullyLoaded ? "secondary" : "primary"}
                        onClick={() => {
                            if (dir.fullyLoaded) {
                                this.clearDirectory(dir);
                                this.forceUpdate();
                            } else {
                                void this.shortAsyncAction(() => this.loadDirectory(dir));
                            }
                        }}>
                        <FontAwesomeIcon icon={dir.fullyLoaded ? faFolderMinus : faFolderPlus} />
                    </Button>
                    <Button
                        className="nowrap"
                        variant={selected ? "secondary" : "primary"}
                        onClick={() => void this.shortAsyncAction(() => this.selectFile(dir))}>
                        {directoryName}
                    </Button>
                </ButtonGroup>
                <ul className="browser-ul">
                    {dir.children.map(subDir => (
                        <li key={subDir.fileResponse.path}>{this.renderDirectory(subDir)}</li>
                    ))}
                </ul>
            </div>
        );
    }

    private renderCreate(): React.ReactNode {
        const fields = {
            entityName: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.files.create.name",
                tooltip: "fields.instance.files.create.name.tip",
                defaultValue: ""
            },
            isDirectory: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.files.create.directory",
                defaultValue: false
            }
        };

        const createNode = this.state.selectedCreateNode!;

        return (
            <React.Fragment>
                <h5>
                    {createNode.fileResponse.path}
                    {createNode.parent ? "/" : ""}
                </h5>
                <h5>
                    <FormattedMessage id="view.instance.files.create" />
                </h5>
                <hr />
                <InputForm
                    fields={fields}
                    onSave={(fields: CreateEntitySettings) =>
                        void this.createEntity(fields, createNode)
                    }
                    saveMessageId="fields.instance.files.create"
                />
            </React.Fragment>
        );
    }

    private renderSelectedFile(): React.ReactNode {
        const canRead = hasFilesRight(this.context.instancePermissionSet, ConfigurationRights.Read);
        const canWrite = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.Write
        );

        const fileDirectoryTree = this.state.selectedFile!;
        const index = Math.max(
            fileDirectoryTree.fileResponse.path.lastIndexOf("\\"),
            fileDirectoryTree.fileResponse.path.lastIndexOf("/")
        );
        const fileName = fileDirectoryTree.fileResponse.path.slice(index + 1);

        const fileIsNotRefreshed =
            !fileDirectoryTree.fileResponse.isDirectory &&
            !fileDirectoryTree.fileResponse.lastReadHash;

        const directoryName =
            fileDirectoryTree == this.state.rootDirectory
                ? "Configuration"
                : fileDirectoryTree.fileResponse.path.slice(index + 1);
        const selectedCreateNode = this.state.selectedCreateNode === fileDirectoryTree;

        const canDeleteDirectories = hasFilesRight(
            this.context.instancePermissionSet,
            ConfigurationRights.Delete
        );

        let headerText = fileDirectoryTree.fileResponse.path.replaceAll("\\", "/");
        if (!headerText.startsWith("/")) headerText = "/" + headerText;

        return (
            <React.Fragment>
                <h5>{headerText}</h5>
                <hr />
                <div className="mb-3">
                    {!fileDirectoryTree.fileResponse.isDirectory ? (
                        <React.Fragment>
                            <OverlayTrigger
                                placement="top"
                                overlay={props => (
                                    <Tooltip id="file-download-location-tooltip" {...props}>
                                        <FormattedMessage id="view.instance.files.download.location" />
                                    </Tooltip>
                                )}>
                                <Button
                                    className="mx-2"
                                    disabled={!canRead}
                                    onClick={() => void this.downloadFile()}>
                                    <FormattedMessage id="view.instance.files.download" />
                                </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                placement="top"
                                show={!canWrite || !fileIsNotRefreshed ? false : undefined}
                                overlay={props => (
                                    <Tooltip id="file-not-refreshed-tooltip" {...props}>
                                        <FormattedMessage id="view.instance.files.replace.stale" />
                                    </Tooltip>
                                )}>
                                <Button
                                    variant="warning"
                                    className="mx-2"
                                    disabled={!canWrite || fileIsNotRefreshed}
                                    onClick={() =>
                                        void this.createEntity(
                                            {
                                                entityName: fileName,
                                                isDirectory: false,
                                                replace: true
                                            },
                                            fileDirectoryTree
                                        )
                                    }>
                                    <FormattedMessage id="view.instance.files.replace" />
                                </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                placement="top"
                                show={!canWrite || !fileIsNotRefreshed ? false : undefined}
                                overlay={props => (
                                    <Tooltip id="file-not-refreshed-tooltip-delete" {...props}>
                                        <FormattedMessage id="view.instance.files.replace.stale" />
                                    </Tooltip>
                                )}>
                                <Button
                                    variant="danger"
                                    className="mx-2"
                                    disabled={!canWrite || fileIsNotRefreshed}
                                    onClick={() => {
                                        if (
                                            confirm(
                                                this.props.intl.formatMessage(
                                                    { id: "view.instance.files.delete.confirm" },
                                                    { path: fileDirectoryTree.fileResponse.path }
                                                )
                                            )
                                        )
                                            void this.shortAsyncAction(() => this.deleteFile());
                                    }}>
                                    <FormattedMessage id="view.instance.files.delete" />
                                </Button>
                            </OverlayTrigger>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Button
                                variant="primary"
                                className="mx-2 nowrap"
                                onClick={() => void this.downloadDirectory(fileDirectoryTree)}>
                                <FontAwesomeIcon icon={faDownload} />
                                &nbsp;
                                <FormattedMessage id="view.instance.files.download.directory" />
                            </Button>
                            <Button
                                variant={selectedCreateNode ? "secondary" : "primary"}
                                className="mx-2 nowrap"
                                onClick={() => {
                                    if (this.state.selectedCreateNode != fileDirectoryTree) {
                                        this.setState({
                                            selectedCreateNode: fileDirectoryTree
                                        });
                                    }
                                }}>
                                <FontAwesomeIcon icon={faFile} />
                                &nbsp;
                                <FormattedMessage id="view.instance.files.create" />
                            </Button>
                            <OverlayTrigger
                                placement="top"
                                show={
                                    canDeleteDirectories &&
                                    fileDirectoryTree.fullyLoaded &&
                                    fileDirectoryTree.children.length === 0
                                        ? false
                                        : undefined
                                }
                                overlay={props => (
                                    <Tooltip id="cant-delete-dir-tooltip" {...props}>
                                        <FormattedMessage
                                            id={
                                                !fileDirectoryTree.fullyLoaded
                                                    ? "view.instance.files.delete.directory.populated.unloaded"
                                                    : canDeleteDirectories
                                                      ? "view.instance.files.delete.directory.populated"
                                                      : "view.instance.files.disallowed.directory.delete"
                                            }
                                        />
                                    </Tooltip>
                                )}>
                                <Button
                                    variant="danger"
                                    className="mx-2 nowrap"
                                    disabled={
                                        !fileDirectoryTree.fullyLoaded ||
                                        !canDeleteDirectories ||
                                        fileDirectoryTree.children.length > 0 ||
                                        fileDirectoryTree == this.state.rootDirectory
                                    }
                                    onClick={() => {
                                        if (
                                            confirm(
                                                this.props.intl.formatMessage(
                                                    {
                                                        id: "view.instance.files.delete.directory.confirm"
                                                    },
                                                    { directoryName }
                                                )
                                            )
                                        )
                                            void this.shortAsyncAction(() =>
                                                this.deleteDirectory(fileDirectoryTree)
                                            );
                                    }}>
                                    <FontAwesomeIcon icon={faTimes} />
                                    &nbsp;
                                    <FormattedMessage id="view.instance.files.delete.directory" />
                                </Button>
                            </OverlayTrigger>
                        </React.Fragment>
                    )}
                </div>
            </React.Fragment>
        );
    }

    private renderBrowserlessForms(): React.ReactNode {
        return <WIPNotice />;
    }
}

Files.contextType = InstanceEditContext;
export default injectIntl(Files);
