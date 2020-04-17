import * as React from 'react';

import delay from '../../utils/delay';

interface IOwnState {
    transitionsIn: boolean;
}

export default abstract class TransitionsComponent<
    IProps,
    IChildState = {}
> extends React.Component<IProps, IChildState & IOwnState> {
    public constructor(
        props: IProps,
        protected readonly transitionsMaxDuration: number
    ) {
        super(props);
    }

    protected async fadeThenExecuteExit(
        unmountingCallback: () => void
    ): Promise<void> {
        await this.doFade();
        unmountingCallback();
    }

    protected fadeAndExecuteExit(
        unmountingCallback: (fadeComplete: PromiseLike<void>) => void
    ): void {
        unmountingCallback(this.doFade());
    }

    private async doFade(): Promise<void> {
        this.setState(prevState => {
            const state: IChildState & IOwnState = {
                ...prevState
            };
            state.transitionsIn = false;
            return state;
        });

        await delay(this.transitionsMaxDuration);
    }
}
