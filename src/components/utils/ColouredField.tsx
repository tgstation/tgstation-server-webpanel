import * as React from 'react';

import './ColouredField.css';

export enum ColourMode {
    Normal,
    Red,
    Yellow
}

interface IProps {
    type: string;
    mode: ColourMode;

    value: string;
    placeholder: string;
    name: string;

    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

    onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default class ColouredField extends React.Component<IProps> {
    public render(): React.ReactNode {
        let colourModeClass: string | null = null;
        switch (this.props.mode) {
            case ColourMode.Red:
                colourModeClass = 'red';
                break;
            case ColourMode.Yellow:
                colourModeClass = 'yellow';
                break;
        }
        return (
            <input
                type={this.props.type}
                className={
                    this.props.mode !== ColourMode.Normal
                        ? `form-control ColouredField-${colourModeClass}`
                        : 'form-control'
                }
                name={this.props.name}
                onChange={this.props.onChange}
                onFocus={this.props.onFocus}
                onBlur={this.props.onBlur}
                value={this.props.value}
                placeholder={this.props.placeholder}
            />
        );
    }
}
