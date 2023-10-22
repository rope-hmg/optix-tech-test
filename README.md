# Optix Tech Test

A simple application to display a list of movies and allow the user to leave a review for a selected movie.

The application is built using Typescript and React with Material UI.

## Development

The following commands will install dependencies and start the application in development mode:

```bash
npm ci
npm start
```

## Docker

The docker file included in the repository can be built and used with the following commands:

```bash
docker build -t optix-tech-test .
docker run -p 8000:80 -d optix-tech-test
```
