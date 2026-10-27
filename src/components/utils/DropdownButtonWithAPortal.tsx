import React, { forwardRef } from "react";
import { Dropdown, DropdownButtonProps } from "react-bootstrap";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import DropdownToggle from "react-bootstrap/esm/DropdownToggle";
import { createPortal } from "react-dom";

// this is just dropdown button wtih a portal. thats it
export const DropdownButtonWithAPortal = forwardRef<HTMLDivElement, DropdownButtonProps>(
    (
        {
            title,
            children,
            bsPrefix,
            rootCloseEvent,
            variant,
            size,
            menuRole,
            renderMenuOnMount,
            disabled,
            href,
            id,
            //   menuVariant,
            flip,
            ...props
        },
        ref
    ) => (
        <Dropdown ref={ref} {...props}>
            <DropdownToggle
                id={id}
                href={href}
                size={size}
                variant={variant}
                disabled={disabled}
                childBsPrefix={bsPrefix}>
                {title}
            </DropdownToggle>
            {createPortal(
                <DropdownMenu
                    role={menuRole}
                    renderOnMount={renderMenuOnMount}
                    rootCloseEvent={rootCloseEvent}
                    //   variant={menuVariant}
                    flip={flip}>
                    {children}
                </DropdownMenu>,
                document.body,
                id
            )}
        </Dropdown>
    )
);
DropdownButtonWithAPortal.displayName = "HorribleHackyDropdownButton";

export default DropdownButtonWithAPortal;
