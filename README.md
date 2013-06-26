selfoss-chrome
==============

Chrome (or Chromium) extension to check if there are unread articles on your instance of Selfoss.

## Installation

#### With the sources

Keeping the source make it easier to update, but you have to keep a folder on your PC.

- Clone the project on your PC : `git clone git@github.com:yDelouis/selfoss-chrome.git`.
- In the address bar of Chrome, type `chrome://extensions`.
- Check "Developer mode".
- Click on "Load unpacked extension…".
- Navigate to the directory in which your clone the sources, and select it.
- Ignore the warning about the file "selfoss-chrome.pem".

Selfoss-chrome is now installed and you are ready to configure it clicking on the selfoss icon at the top right.

To update the extension :
- Navigate to the source directory.
- Pull the changes : `git pull origin master`.
- In the address bar of Chrome, type `chrome://extensions`.
- Type "CTRL+R".


#### With the crx file

You just have to download one file and to add it to chrome.
But to update it, you may have to delete the previous one and add the new one.

- Download the file "selfoss-chrome.crx".
- In the address bar of Chrome, type `chrome://extensions`.
- Drag and drop the selfos-chrome.crx file on Chrome.
- That's it.

