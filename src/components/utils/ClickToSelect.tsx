import React, { type PropsWithChildren } from "react";

export const ClickToSelect = ({ children }: PropsWithChildren<unknown>) => {
    return (
        <span
            onClick={e => {
                e.preventDefault();
                const sel = window.getSelection();
                if (!sel) return;
                const range = document.createRange();
                range.selectNodeContents(e.currentTarget);
                sel.removeAllRanges();
                sel.addRange(range);
            }}>
            {children}
        </span>
    );
};
