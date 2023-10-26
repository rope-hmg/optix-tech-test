import { optionFromTruthyValue } from "../utilities/option";

export type Company = {
    id: string,
    name: string,
}

export type Film = {
    id: string,
    reviews: number[],
    title: string,
    filmCompanyId: string,
    cost: number,
    releaseYear: number,
};

export type Film_Listing = {
    filmId: string,
    title: string,
    averageReviewValue: number,
    averageReviewScore: string,
    productionCompany: string,
}

export type Review_Response
    = { success: true, message: string }
    | { success: false };

const FILM_DATA_URL = "https://giddy-beret-cod.cyclic.app/movies";
const COMPANY_DATA_URL = "https://giddy-beret-cod.cyclic.app/movieCompanies";
const SUBMIT_REVIEW_URL = "https://giddy-beret-cod.cyclic.app/submitReview";

export class Film_Data_Service {
    //----------------------------------------------------------
    // Static Members
    //----------------------------------------------------------

    // Use the singleton pattern to have a single instance of this service that
    // all the code can interact with.
    private static instance: Film_Data_Service;

    // Use lazy instantiation to create the instance of the service when it is
    // first requested. This also avoids running the constructor when the module
    // is first imported.
    public static Instance(): Film_Data_Service {
        if (this.instance === undefined) {
            this.instance = new Film_Data_Service();
        }

        return this.instance;
    }

    //----------------------------------------------------------
    // Instance Members
    //----------------------------------------------------------

    // Use a map to cache the film listings. This avoids having to recalculate the
    // string every time the Film_Listing component is re-rendered.
    private readonly cachedFilmListings = new Map<Film, Film_Listing>();

    private companyData: readonly Company[] = [];
    private filmData: readonly Film[] = [];

    public getFilmCount(): number {
        return this.filmData.length;
    }

    public getFilmById(filmId: string): Film | undefined {
        // NOTE:
        // This has O(N) time complexity. We should measure the impact and potentially
        // change to a Map lookup with O(1) time complexity. Or we could use numeric
        // ids, sort the filmData array and then use something like binary search for
        // a O(log N) time complexity.
        return this.filmData.find((film) => film.id === filmId);
    }

    public async fetchNewListings(): Promise<void> {
        const fetchData = <T>(url: string): Promise<T[]> => fetch(url).then((r) => r.json());

        [this.companyData, this.filmData] = await Promise.all([
            fetchData<Company>(COMPANY_DATA_URL),
            fetchData<Film>(FILM_DATA_URL),
        ]);
    }

    // NOTE:
    // filmId is not used, but it feels like it should be.
    public async submitFilmReview(_filmId: string, reviewContent: string): Promise<Review_Response> {
        const response = await fetch(SUBMIT_REVIEW_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review: reviewContent }),
        });

        let result: Review_Response;

        if (response.ok) {
            const { message } = await response.json();

            result = { success: true, message };
        } else {
            result = { success: false };
        }

        return result;
    }

    public getFilmListingsForPage(page: number, rowsPerPage: number): Film_Listing[] {
        const startIndex = page * rowsPerPage;

        // Ideally this would be done with a for loop to avoid allocating
        // temporary objects that must be cleaned up by the GC and to make
        // it more clear what the code is actually doing.
        return this.filmData
            .slice(startIndex, startIndex + rowsPerPage)
            .map((film) => {
                return optionFromTruthyValue(this.cachedFilmListings.get(film))
                    .unwrapOrElse(() => {
                        const listing = this.generateFilmListing(film);
                        this.cachedFilmListings.set(film, listing);

                        return listing;
                    });
            });
    }

    private generateFilmListing(film: Film): Film_Listing {
        const reviewCount = film.reviews.length;

        let averageReviewValue = film.reviews.reduce((acc, reviewValue) => acc + reviewValue);
        let averageReviewScore: string;

        if (averageReviewValue > 0 && reviewCount > 0) {
            averageReviewValue /= reviewCount;
            averageReviewScore = averageReviewValue.toFixed(1);
        } else {
            averageReviewScore = "0";
        }

        //----------------------------------------------------------

        const productionCompany = this.companyData
            .find((company) => company.id === film.filmCompanyId)?.name
            ?? "Unknown";

        //----------------------------------------------------------

        return {
            filmId: film.id,
            title: film.title,
            averageReviewValue,
            averageReviewScore,
            productionCompany,
        };
    }
}
