# How to test
You can modify the manifest file and add the AccountChooser.html file under the test
folder to it.  That way you can locally without constantly logging in and out.
Add:

      {
        "matches": ["http://localhost:*/*/AccountChooser.html"],
        "js": ["google_accounts.js"]
      }

The start a local web server with the files under the test folder

