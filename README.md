# Verse Catch

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/Jeremiah-Quaynor/verse-catch.git
```

Then, navigate to the client directory and install the dependencies:

```bash
cd verse-catch-client
npm install --legacy-peer-deps
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To start the server, navigate to the server directory and install the dependencies:

```bash
cd ../verse-catch-server
npm install --legacy-peer-deps
# or
yarn install
```

Then, run the server:

```bash
npm start
# or
yarn start
```
Open [http://localhost:4002](http://localhost:4002) with your browser to see the result.


## Project Structure

The project is divided into two main parts:

- `verse-catch-client`: The frontend application built with Next.js.
- `verse-catch-server`: The backend server.

## Client Directory Structure

- `app/`: Contains the main application files.
- `components/`: Contains reusable UI components.
- `lib/`: Contains utility functions.
- `public/`: Contains static files.
- `styles/`: Contains global styles.

## Server Directory Structure

- `src/`: Contains the server source code.
- `src/bibles/`: Contains Bible-related functionalities.
- `src/temp_audio/`: Contains temporary audio files.
- `src/utils/`: Contains utility functions.

## Scripts

### Client

- `npm run dev`: Runs the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs the linter.

### Server

- `npm start`: Starts the server.

## License

This project is licensed under the MIT License.