/* eslint-disable react/react-in-jsx-scope */

import { PropsWithChildren } from "react";

type EmptyProps = {
    icon: React.ReactNode;
    title: string;
    description?: string;
};

/**
 * Like those placeholder things.
 */
export const Empty = ({ icon, title, description, children }: PropsWithChildren<EmptyProps>) => {
    return (
        <div className="d-flex flex-column align-items-center p-5" style={{ gap: "1.5rem" }}>
            <div>{icon}</div>
            <div className="d-flex flex-column align-items-center">
                <h3>{title}</h3>
                <small className="text-body-secondary">{description}</small>
            </div>
            {children}
        </div>
    );
};
