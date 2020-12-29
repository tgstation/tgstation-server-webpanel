import React from "react";

interface IProps {}
interface IState {}

export default class StepComplete extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        return "complete!";
    }
}
