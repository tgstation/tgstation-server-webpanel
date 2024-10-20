import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import IHomeCardProps from "./HomeCardProps";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

const HomeCard = (props: IHomeCardProps) => {
    const enabled = props.calculateEnabled ? props.calculateEnabled(props.queryData) : true;
    const RenderCard = () => (
        <Card
            className={enabled ? "text-primary hover:text-primary-foreground" : "text-destructive"}>
            <CardContent style={{ height: "245px" }} className="text-center border-0">
                <FontAwesomeIcon className="w-4/5 h-4/5 mt-4 mb-4" icon={props.icon} />
                <hr />
            </CardContent>
            <CardFooter className={"justify-center font-bold text-lg" + (enabled ? "" : "italic")}>
                <FormattedMessage id={props.localeNameId} />
            </CardFooter>
        </Card>
    );
    return (
        <div className="m-4">
            {enabled ? <Link to={props.path}>{RenderCard()}</Link> : RenderCard()}
        </div>
    );
};
export default HomeCard;
