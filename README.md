# Priyanshi
SOAP Web Client with Google OAuth and WS-Security
This project is a Node.js-based web application that integrates Google OAuth 2.0 authentication with a SOAP Web Service using WS-Security. The main purpose of this project is to demonstrate how a user can log in using their Google account and then make a secure SOAP request to a backend service that validates the credentials using the WS-Security standard.

The application consists of both a SOAP client and a SOAP server implemented in the same codebase. Once the user logs in, they can click a button on the frontend to make a request to the backend. The backend then performs a SOAP call with a UsernameToken for WS-Security. The SOAP server checks the credentials and returns a response, which is shown on the frontend.

📁 Project Overview
The project includes:

An Express server that serves the frontend and handles authentication.

Integration with passport-google-oauth20 for Google login.

A SOAP server that listens on port 8000 and verifies WS-Security headers.

A route /get-soap-result which sends a SOAP request with a username and password.

A frontend page (frontend.html) that provides a login button, logout button, and a “Call SOAP” button to fetch and display the result.

A WSDL file (service.wsdl) that defines the SOAP interface and operations.

🚀 How It Works
When the user accesses the app, they are presented with a simple UI. They can choose to log in using their Google account. Upon successful login, the session is maintained using express-session. Once logged in, the user can click the "Call SOAP" button, which triggers a frontend fetch call to the backend route /get-soap-result.

This backend route internally acts as a SOAP client. It sends a SOAP request to a locally running SOAP service on port 8000, along with a WS-Security UsernameToken (in this case, admin and password123). The SOAP server checks the credentials and, if valid, processes the request (by reversing the input string "HelloWorld") and sends it back as a result. The frontend then displays the reversed result to the user.

⚙️ Setup Instructions
To get this project running on your machine, follow the steps below:

Clone the Repository
First, clone this project to your local machine using Git:

bash
Copy
Edit
git clone https://github.com/your-username/soap-auth-demo.git
cd soap-auth-demo
Install Dependencies
Install all required Node.js packages using:

bash
Copy
Edit
npm install
Set up Environment Variables
Create a .env file in the root directory and add the following:

env
Copy
Edit
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret
Make sure to replace the values with your actual credentials from the Google Cloud Console.

Run the Application
Start both the Express and SOAP servers using:

bash
Copy
Edit
node server.js
This will start the web app at http://localhost:3000 and the SOAP service at http://localhost:8000/ws-security.

🧪 Testing the App
Visit the Web App
Go to http://localhost:3000 in your browser.

Login with Google
Click on the "Login with Google" button. You'll be redirected to authenticate using your Google account.

Call the SOAP Service
After logging in, click the "Call SOAP" button. You should see a response like:
SOAP Response: {"result":"dlroWolleH"}

This means the SOAP server received your request, authenticated it, processed it, and returned the reversed string.

Logout
You can click the "Logout" link to end the session.

✅ Requirements & Technologies
Node.js

Express.js

express-session

passport & passport-google-oauth20

dotenv

helmet (for basic security headers)

node-soap (SOAP server and client)

HTML/CSS (simple frontend)

📄 License
This project is open-source and available under the MIT License.
