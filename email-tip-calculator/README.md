# Email Tip Calculator

Attempts to pull transaction emails from GMail for the current date and sum up all Tips.

---

# Authorizing

Authorization is done through two different secret files. The first one is provided when the app is setup. You cannot
obtain this one on your own.

The second one will be recorded when you authenticate while running the application. When you attempt to run the app, it
will provide you a link. Place this link into your preferred browser. It will ask you to authenticate the application's
access to your account. Take a moment and validate the requested permissions look amenable. If you accept the terms, a
code will be generated for you. Copy the code and paste it into the terminal window to continue.

This authorization will last ~ 7 days, at which point you must repeat the process.

The app requires the [gmail readonly permission](https://developers.google.com/identity/protocols/oauth2/scopes#gmail).
It needs this to search and retrieve the desired emails. 

---

# Functionality

The application will do the following:
- Asks the user to grant access to their gmail.
- Performs a search for emails matching expected template based on current date. (Batch process)
- For each matched message, it fetches the message content to extract the tip amount.
- If found, adds the tip to the running total.
- After finishing batch process, it audits out the final total.

---

# How to run it

You can run the process by opening a terminal to this directory and running `npm run start`.

