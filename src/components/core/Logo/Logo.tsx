import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/images/logo.svg";

const Logo = () => {
    const [meme, setMeme] = useState(4); // chosen by fair dice roll
    return (
        <>
            <TooltipProvider>
                <Tooltip
                    onOpenChange={open => {
                        if (open) {
                            setMeme(Math.round(Math.random() * 100) % 26);
                        }
                    }}>
                    <TooltipTrigger>
                        <img className="nowrap corner-logo" width={50} height={50} src={logo} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <FormattedMessage id={`view.meme_${meme}`} />
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    );
};

export default Logo;
