# NexCode

NexCode is a modern collaborative coding platform built with Next.js. It allows developers to write, manage, and collaborate on code efficiently through a clean and responsive user interface.

## Features

* Modern and responsive UI
* Built with Next.js App Router
* Tailwind CSS styling
* Static export support
* Docker-ready deployment
* Fast and optimized production build

## Tech Stack

* Next.js
* React
* JavaScript
* Tailwind CSS
* Docker
* Express.js

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

to view the application.

## Production Build

Generate a production build:

```bash
npm run build
```

The build output is generated inside the:

```txt
out/
```

directory.

## Static Export

This project uses:

```js
output: "export"
```

in `next.config.mjs` to generate static files.

## Deploying with Backend

Copy the generated files to the backend public folder:

```bash
cp -r out/* ../Backend/public/
```

Backend structure:

```txt
Backend/
├── public/
├── server.js
├── package.json
└── node_modules/
```

## Running the Backend

```bash
cd ../Backend
node server.js
```

Visit:

```txt
http://localhost:3000
```

## Docker Deployment

Build Docker Image:

```bash
docker build -t nexcode .
```

Run Docker Container:

```bash
docker run -p 3000:3000 nexcode
```

## Project Structure

```txt
frontend/
├── app/
├── public/
├── out/
├── next.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

## License

This project is licensed under the MIT License.
