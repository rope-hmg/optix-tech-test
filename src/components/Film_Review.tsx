import React, { FormEventHandler } from "react";
import {
    Button,
    Card,
    CardContent,
    LinearProgress,
    TextField,
    Typography,
} from "@mui/material";

import { Film_Data_Service } from "../services/film_data_service";

type Film_Review_Props = {
    selectedId: string | undefined,
    setSelectedId(id: string | undefined): void;
};

type Film_Review_Message = {
    isError: boolean;
    text: string;
}

export const Film_Review: React.FC<Film_Review_Props> = (props) => {
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
