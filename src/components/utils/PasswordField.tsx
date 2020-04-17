import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import ReactIsCapsLockActive from '@matsun/reactiscapslockactive';
import './PasswordField.css';

interface IOwnProps {
    value: string;
    placeholder: string;
    name: string;

    onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

interface IState {
    focused: boolean;
}

type IProps = IOwnProps & InjectedIntlProps;

class PasswordField extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.state = {
            focused: false
        };
    }

    public render(): React.ReactNode {
        return (
            <ReactIsCapsLockActive>
                {(active: boolean) => {
                    const capsLockWarning = active && this.state.focused;
                    let placeholder = this.props.placeholder;
                    if (capsLockWarning)
                        placeholder = `${placeholder} (${this.props.intl.formatMessage(
                            { id: 'password.capslock' }
                        )})`;
                    return (
                        <input
                            type="password"
                            className={
                                capsLockWarning
                                    ? 'form-control PasswordField-caps'
                                    : 'form-control'
                            }
                            name={this.props.name}
                            onChange={this.props.onChange}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                            value={this.props.value}
                            placeholder={placeholder}
                        />
                    );
                }}
            </ReactIsCapsLockActive>
        );
    }

    private onBlur(): void {
        this.setState({ focused: false });
    }

    private onFocus(): void {
        this.setState({ focused: true });
    }
}

export default injectIntl(PasswordField);
