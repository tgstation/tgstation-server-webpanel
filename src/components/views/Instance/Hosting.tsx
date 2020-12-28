import React from "react";

import WIPNotice from "../../utils/WIPNotice";

interface IProps {}
interface IState {}

export default class Hosting extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        return <WIPNotice />;
    }
}
