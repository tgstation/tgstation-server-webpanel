import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HTMLInputTypeAttribute, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

interface IProps {
    children: ReactNode;
    label: string;
    tooltip?: string;
    type?: HTMLInputTypeAttribute;
}

const InputGroup = (props: IProps) => {
    return (
        <>
            <div className="px-4 inline-flex justify-between items-center min-w-fit rounded-s-md border text-sm">
                <Label>
                    <FormattedMessage id={props.label} />
                </Label>
                {props.tooltip ? (
                    <div className="items-end">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FontAwesomeIcon className="ml-4" icon={faInfo} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <FormattedMessage id={props.tooltip} />
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ) : null}
            </div>
            {props.children}
        </>
    );
};

export default InputGroup;
