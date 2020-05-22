import { RouteComponentProps, withRouter } from 'react-router';
import { Component, ReactNode } from 'react';

interface IProps extends RouteComponentProps {}
interface IState {
    clear: boolean;
}

class Reload extends Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            clear: false
        };
    }
    public componentDidUpdate(prevProps: IProps): void {
        if (this.state.clear) {
            this.setState({
                clear: false
            });
            return;
        }
        if (
            prevProps.location.pathname == this.props.location.pathname &&
            prevProps.location.key != this.props.location.key
        ) {
            this.setState({
                clear: true
            });
        }
    }

    public render(): ReactNode {
        return this.state.clear ? '' : this.props.children;
    }
}

export default withRouter(Reload);
