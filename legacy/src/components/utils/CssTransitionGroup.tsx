import React from "react";
import { TransitionGroup } from "react-transition-group";
import CSSTransition from "react-transition-group/CSSTransition";

interface IProps {
    children: React.ReactNode;
}

export default class CssTransitionGroup extends React.Component<IProps> {
    public render(): React.ReactNode {
        return (
            <TransitionGroup>
                <CSSTransition
                    appear
                    classNames="anim-fade"
                    addEndListener={(node, done) => {
                        node.addEventListener("transitionend", done, false);
                    }}>
                    {this.props.children}
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
