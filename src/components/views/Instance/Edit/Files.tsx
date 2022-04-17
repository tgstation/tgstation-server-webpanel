import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import React from "react";
import { ConfigurationFileResponse } from "../../../../ApiClient/generatedcode/generated";
import ConfigurationFileClient from "../../../../ApiClient/ConfigurationFileClient";
import { RouteData } from "../../../../utils/routes";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import Loading from "../../../utils/Loading";

interface IProps {}

interface IState {
    rootDirectory: ConfigurationFileResponse[];
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

    private async loadRootDir() {
        const response = await ConfigurationFileClient.getRootDirectory(this.context.instance.id, {
            page: this.state.page
        });

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

            this.setState({
                rootDirectory: response.payload.content,
                maxPage: response.payload.totalPages
            });
        }
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

        return (
            <div>
                {this.state.rootDirectory.map(file => {
                    return <div key={file.path}>{JSON.stringify(file)}</div>;
                })}
            </div>
        );
    }
}

Files.contextType = InstanceEditContext;
export default Files;
