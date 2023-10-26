import React from "react";
import { Refresh } from "@mui/icons-material";
import {
    AppBar,
    Box,
    Container,
    IconButton,
    LinearProgress,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";

import { Film_Data_Service } from "../services/film_data_service";
import { Film_Listing } from "./Film_Listing";
import { Film_Review } from "./Film_Review";

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





