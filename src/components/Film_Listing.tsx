import React from "react";
import { TablePaginationActionsProps } from "@mui/material/TablePagination/TablePaginationActions";
import {
    Box,
    IconButton,
    Paper,
    Rating,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import {
    FirstPage,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LastPage,
} from "@mui/icons-material";

import { Film_Data_Service } from "../services/film_data_service";

const Table_Pagination_Actions: React.FC<TablePaginationActionsProps> = (props) => {
    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        props.onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.onPageChange(event, props.page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.onPageChange(event, props.page + 1);
    };

    const pageCount = Math.ceil(props.count / props.rowsPerPage) - 1;

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.onPageChange(event, Math.max(0, pageCount));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={props.page === 0}
                aria-label="first page"
            >
                <FirstPage />
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={props.page === 0}
                aria-label="previous page"
            >
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={props.page >= pageCount}
                aria-label="next page"
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={props.page >= pageCount}
                aria-label="last page"
            >
                <LastPage />
            </IconButton>
        </Box>
    );
}

type Film_Listing_Props = {
    filmCount: number;
    selectedId: string | undefined;
    setSelectedId(id: string | undefined): void;
};

export const Film_Listing: React.FC<Film_Listing_Props> = (props) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(3);

    const handleChangePage = (
        _event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Movie Title</TableCell>
                        <TableCell>Review Score</TableCell>
                        <TableCell>Production Company</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {
                        Film_Data_Service.Instance()
                            .getFilmListingsForPage(page, rowsPerPage)
                            .map((listing) => (
                                <TableRow
                                    key={listing.filmId}
                                    onClick={() => { props.setSelectedId(listing.filmId) }}
                                    selected={listing.filmId === props.selectedId}
                                >
                                    <TableCell>
                                        <Typography variant="h6" color="text.secondary">
                                            {listing.title}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="h1" component="span" color="text.secondary">
                                            {listing.averageReviewScore}
                                        </Typography>
                                        <Rating name="read-only" value={listing.averageReviewValue / 2} precision={0.5} readOnly />
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="h6" color="text.secondary">
                                            {listing.productionCompany}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                    }
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[3]}
                            colSpan={3}
                            count={props.filmCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                    'aria-label': 'rows per page',
                                },
                                native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={Table_Pagination_Actions}
                        />
                    </TableRow>
                </TableFooter>
            </Table >
        </TableContainer>
    );
}
