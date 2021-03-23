import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import RouteController from "../../utils/RouteController";
import { AppRoute, AppRoutes } from "../../utils/routes";

interface IProps {}
interface IState {
    routes: Array<AppRoute>;
}

export default class Home extends React.Component<IProps, IState> {
    public static readonly Route: string = "/";

    public constructor(props: IProps) {
        super(props);
        this.setRoutes = this.setRoutes.bind(this);

        this.state = {
            routes: []
        };
    }

    private setRoutes(routes: AppRoute[]) {
        this.setState({ routes });
    }

    public async componentDidMount(): Promise<void> {
        this.setState({
            routes: await RouteController.getRoutes(false)
        });
        RouteController.on("refreshAll", this.setRoutes);
    }

    public componentWillUnmount(): void {
        RouteController.removeListener("refreshAll", this.setRoutes);
    }

    public render(): React.ReactNode {
        return `
            Testing!\n
            {Info about TGS, version and stuff}\n
            {Server instances}
        `;
    }
}
