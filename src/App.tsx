import React, { FormEventHandler } from "react";
import { TablePaginationActionsProps } from "@mui/material/TablePagination/TablePaginationActions";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    LinearProgress,
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
    TextField,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    FirstPage,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LastPage,
    Refresh,
} from "@mui/icons-material";

import { Film_Data_Service } from "./film_data_service";

export const App: React.FC = () => {
    const [filmCount, setFilmCount] = React.useState(Film_Data_Service.Instance().getFilmCount());
    const [selectedId, setSelectedId] = React.useState<string>();
    const [error, setError] = React.useState<string>();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchListings = async () => {
            try {
                await Film_Data_Service.Instance().fetchNewListings();

                setError(undefined);
            } catch {
                setError("Unable to fetch movies list, please try again later");
            }

            setIsLoading(false);
        };

        fetchListings();
    }, []);

    const handleRefreshMovies = async () => {
        try {
            setIsLoading(true);
            await Film_Data_Service.Instance().fetchNewListings();

            // Update the selectedId to trigger a re-render.
            setSelectedId(undefined);
            setFilmCount(Film_Data_Service.Instance().getFilmCount());
        } catch {
            setError("Unable to update movies list, please try again later");
        }

        setIsLoading(false);
    };

    return (
        <Container fixed>
            {isLoading && <LinearProgress color="warning" />}

            <Box>
                <AppBar position="static">
                    <Toolbar>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                            Welcome to Movie database!
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />

                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Typography>
                                Movie Count: {filmCount}
                            </Typography>
                        </Box>

                        <Tooltip title="Refresh Movies">
                            <IconButton onClick={handleRefreshMovies}>
                                {!isLoading && <Refresh />}
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
            </Box>

            {error && <Typography color="error">{error}</Typography>}

            <Film_Listing selectedId={selectedId} setSelectedId={setSelectedId} filmCount={filmCount} />
            <Film_Review selectedId={selectedId} setSelectedId={setSelectedId} />
        </Container>
    );
};

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

const Film_Listing: React.FC<Film_Listing_Props> = (props) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(3);

    const listings: React.ReactElement[] = [];

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listings.length) : 0;

    for (const listing of Film_Data_Service.Instance().getFilmListingsForPage(page, rowsPerPage)) {
        listings.push(
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
        );
    }

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
                    {listings}
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


type Film_Review_Props = {
    selectedId: string | undefined,
    setSelectedId(id: string | undefined): void;
};

type Film_Review_Message = {
    isError: boolean;
    text: string;
}

const Film_Review: React.FC<Film_Review_Props> = (props) => {
    const [message, setMessage] = React.useState<Film_Review_Message>();
    const [loading, setLoading] = React.useState(false);

    const handleSubmitReview: FormEventHandler = async (e) => {
        e.preventDefault();

        const reviewElement = document.getElementById("outlined-multiline-static") as HTMLTextAreaElement | null;
        const reviewContent = reviewElement?.value;

        if (reviewContent === undefined || reviewContent.length === 0) {
            setMessage({
                isError: true,
                text: "No review provided",
            });
        } else if (reviewContent.length > 100) {
            // NOTE:
            // This will probably never show up because we set a max length of 100 on
            // TextField component. It's good to have the validation here just in case
            // someone is trying to be sneaky.
            //
            // Obviously this would also need to be validated on the server side too.
            setMessage({
                isError: true,
                text: "Review is too long, please keep it to 100 characters or less",
            });
        } else {
            setLoading(true);

            const response = await Film_Data_Service
                .Instance()
                .submitFilmReview(props.selectedId!, reviewContent);

            setLoading(false);

            if (response.success) {
                setMessage({
                    isError: false,
                    text: response.message
                });
            } else {
                setMessage({
                    isError: true,
                    text: "Failed to submit review, please try again later"
                });
            }
        }
    };

    let selectedFilmContent: React.ReactElement;

    if (props.selectedId === undefined) {
        selectedFilmContent = <p>No Film Selected</p>;
    } else {
        const selectedFilm = Film_Data_Service.Instance().getFilmById(props.selectedId);

        if (selectedFilm === undefined) {
            // Update the selectedId to undefined because the current selectedId is invalid.
            // This also has the added benefit of avoiding `getFilmById` being called again.
            props.setSelectedId(undefined);

            selectedFilmContent = <p>No Film Selected</p>;
        } else {
            selectedFilmContent = (
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            {selectedFilm.title}
                        </Typography>

                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Please leave a review below
                        </Typography>

                        {loading && <LinearProgress color="warning" />}
                        {message && <Typography color={message.isError ? "error" : "success"}>{message.text}</Typography>}

                        <form onSubmit={handleSubmitReview}>
                            <TextField
                                id="outlined-multiline-static"
                                label="Review"
                                error={message?.isError}
                                disabled={loading}
                                fullWidth
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 100 }}
                            />
                            <br />
                            <Button type="submit">Submit Review</Button>
                        </form>
                    </CardContent>
                </Card>
            );
        }
    }

    return selectedFilmContent;
};
