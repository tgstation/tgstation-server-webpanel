import React, { useCallback, useEffect, useState } from "react";
import { Pagination as RBSPage } from "react-bootstrap";

export type PaginationProps = {
    onPageChange?: React.Dispatch<React.SetStateAction<number>>;
    /// Current Page. Set with onPageChange to make this controlled
    page?: number;
    maxPage?: number;
    pageSize?: number;
    totalItems?: number;
};

/**
 * Pagination but better.
 *
 * Creates skip-arrows when pages are more than 6
 *
 * Internally handles page counting, you can manually the state by setting page and listening to onPageChange.
 */
export const Pagination = ({
    onPageChange = () => {},
    page = 1,
    maxPage,
    pageSize = 10,
    totalItems = 100
}: PaginationProps) => {
    if (!maxPage) {
        maxPage = Math.round(pageSize / totalItems);
    }
    const [myPage, setMyPage] = useState(page);

    const setPage = useCallback(
        (newP: number) => {
            newP = Math.min(Math.max(newP, 1), maxPage);
            onPageChange(newP);
            setMyPage(newP);
        },
        [maxPage, onPageChange]
    );

    const isAValidSalad = (newP: number) => newP === Math.min(Math.max(newP, 1), maxPage);

    useEffect(() => {
        setPage(page);
    }, [page, setPage]);

    const shouldMakePointyArrows = maxPage > 6;
    return (
        <div className="d-flex justify-content-between">
            <div className="d-flex align-items-center">
                <small>
                    Showing {Math.max((page - 1) * pageSize + 1, 1)}-
                    {Math.min(page * pageSize, totalItems)} of {totalItems}
                </small>
            </div>
            <RBSPage className="mb-0">
                {!!shouldMakePointyArrows && (
                    <RBSPage.First
                        onClick={() => {
                            setPage(1);
                        }}
                    />
                )}
                <RBSPage.Prev
                    disabled={!isAValidSalad(myPage - 1)}
                    onClick={() => {
                        setPage(myPage - 1);
                    }}
                />
                {isAValidSalad(myPage - 2) && <RBSPage.Item>{myPage - 2}</RBSPage.Item>}
                {isAValidSalad(myPage - 1) && <RBSPage.Item>{myPage - 1}</RBSPage.Item>}
                <RBSPage.Item active>{myPage}</RBSPage.Item>
                {isAValidSalad(myPage + 1) && <RBSPage.Item>{myPage + 1}</RBSPage.Item>}
                {isAValidSalad(myPage + 2) && <RBSPage.Item>{myPage + 2}</RBSPage.Item>}
                <RBSPage.Next
                    disabled={!isAValidSalad(myPage + 1)}
                    onClick={() => {
                        setPage(myPage + 1);
                    }}
                />
                {!!shouldMakePointyArrows && (
                    <RBSPage.Last
                        onClick={() => {
                            setPage(maxPage);
                        }}
                    />
                )}
            </RBSPage>
        </div>
    );
};
