import { Loader2 } from "lucide-react"
import { FormattedMessage } from "react-intl";

interface IProps {
    messageId?: string
}

const Loading = function (props: IProps) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {props.messageId ? <p className="text-sm font-medium text-muted-foreground">
            <FormattedMessage id={props.messageId} />
        </p> : null}
      </div>
    )
  }

export default Loading;
