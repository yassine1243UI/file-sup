@echo off
echo Deploying the project...

:: Change to the front directory and install dependencies
echo Installing front-end dependencies...
cd front
npm install

:: Return to the root directory
cd ..

:: Change to the back directory and install dependencies
echo Installing back-end dependencies...
cd back
npm install

:: Run npm run dev in the back directory
echo Starting back-end development server...
npm run dev

:: Return to the root directory after running the server
cd ..

echo Deployment finished.
