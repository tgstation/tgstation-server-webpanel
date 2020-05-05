import React from 'react';
import { RingLoader } from 'react-spinners';

export default function Loading(): React.FunctionComponentElement<null> {
    return (
        <div className="App-loading">
            <RingLoader color="#E3EFFC" size={500} />
        </div>
    );
}
