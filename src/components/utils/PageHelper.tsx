import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ComponentPropsWithoutRef } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Pagination from "react-bootstrap/Pagination";
import Popover from "react-bootstrap/Popover";
import { FormattedMessage } from "react-intl";

type IProps = {
    selectPage: (page: number) => void;
    totalPages: number;
    currentPage: number;
} & Partial<ComponentPropsWithoutRef<"div">>;

interface IState {
    showGoto: boolean;
    gotoValue: number;
}

export default class PageHelper extends React.PureComponent<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            showGoto: false,
            gotoValue: props.currentPage
        };
    }

    public render(): React.ReactNode {
        const items: React.ReactNodeArray = [];

        const maxRight = Math.max(this.props.totalPages - this.props.currentPage - 1, 0);
        const maxLeft = Math.max(this.props.currentPage - 2, 0);

        const min = Math.max(
            this.props.currentPage -
                Math.max(
                    5 - Number(this.props.currentPage !== this.props.totalPages) - maxRight,
                    2
                ),
            2
        );
        const max = Math.min(
            this.props.currentPage +
                Math.max(5 - Number(this.props.currentPage !== 1) - maxLeft, 2),
            this.props.totalPages - 1
        );

        //Start at the second page and stop at the second to last page
        for (let i = min; i <= max; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === this.props.currentPage}
                    onClick={() => this.props.selectPage(i)}>
                    {i}
                </Pagination.Item>
            );
        }

        const ellipsis = this.props.totalPages > 7 ? <Pagination.Ellipsis disabled /> : null;

        const findPopover = (
            <Popover id="popover-gotopage">
                <Popover.Title>
                    <FormattedMessage id="generic.goto.title" />
                </Popover.Title>
                <Popover.Content>
                    <form
                        className="d-flex"
                        onSubmit={e => {
                            e.preventDefault();
                            this.props.selectPage(this.state.gotoValue);
                            this.setState({
                                showGoto: false
                            });
                        }}>
                        <Form.Control
                            className="mr-2"
                            type="number"
                            min={1}
                            max={this.props.totalPages}
                            value={this.state.gotoValue}
                            onChange={e => this.setState({ gotoValue: parseInt(e.target.value) })}
                            custom
                        />
                        <Button type="submit">
                            <FormattedMessage id="generic.goto" />
                        </Button>
                    </form>
                </Popover.Content>
            </Popover>
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { selectPage: _1, totalPages: _2, currentPage: _3, ...props } = this.props;

        return (
            <div className="text-center" {...props}>
                <Pagination className="justify-content-center">
                    <Pagination.Prev
                        disabled={this.props.currentPage <= 1}
                        onClick={() =>
                            this.props.selectPage(Math.max(this.props.currentPage - 1, 1))
                        }
                    />
                    <Pagination.Item
                        active={this.props.currentPage <= 1}
                        onClick={() => this.props.selectPage(1)}>
                        1
                    </Pagination.Item>
                    {ellipsis}
                    {items}
                    {ellipsis}
                    {this.props.totalPages >= 2 ? (
                        <Pagination.Item
                            active={this.props.currentPage >= this.props.totalPages}
                            onClick={() => this.props.selectPage(this.props.totalPages)}>
                            {this.props.totalPages}
                        </Pagination.Item>
                    ) : null}
                    {this.props.totalPages > 7 ? (
                        <OverlayTrigger
                            show={this.state.showGoto}
                            placement="top"
                            overlay={findPopover}>
                            <Pagination.Item
                                onClick={() =>
                                    this.setState(prev => {
                                        return {
                                            showGoto: !prev.showGoto
                                        };
                                    })
                                }>
                                <FontAwesomeIcon icon="search" />
                            </Pagination.Item>
                        </OverlayTrigger>
                    ) : null}
                    <Pagination.Next
                        disabled={this.props.currentPage >= this.props.totalPages}
                        onClick={() =>
                            this.props.selectPage(
                                Math.min(this.props.currentPage + 1, this.props.totalPages)
                            )
                        }
                    />
                </Pagination>
            </div>
        );
    }
}
