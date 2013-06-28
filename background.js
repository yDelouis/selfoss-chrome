var checkPeriodInMinute = 5;

var iconEnabled = {path: "selfoss_enabled.png"};
var iconDisabled = {path: "selfoss_disabled.png"};
var badgeBackgroundColorEnabled = {color: [208, 0, 24, 255]};
var badgeBackgroundColorDisabled = {color: [190, 190, 190, 230]};

var requestTimeout = 2 * 1000;

/************** Common methods ************************************/

function getSelfossUrl(usesHttps) {
	var scheme = "http";
	return scheme+"://"+localStorage.selfossUrl;
}

function getUnreadCountUrl() {
	var url = getSelfossUrl(true) + "/stats";
	return addAuthParams(url);
}

function isSelfossUrl(url) {
	return url.indexOf(localStorage.selfossUrl) !== -1;
}

function needAuth() {
	return localStorage.hasOwnProperty("username")
			&& localStorage.hasOwnProperty("password")
			&& localStorage.username != ""
			&& localStorage.password != "";
}

function addAuthParams(url) {
	if (needAuth()) {
		if (url.indexOf("?") === -1) {
			url += "?";
		} else {
			url += "&";
		}
		url += "username="+encodeURIComponent(localStorage.username);
		url += "&password="+encodeURIComponent(localStorage.password);
	}
	return url;
}

/************* End commons methods *******************************/

/************* Icon update method ********************************/

function updateIcon() {
	console.log("Updating icon");
	var icon = iconDisabled;
	var badgeBkgColor = badgeBackgroundColorDisabled;
	var badgeText = "?";

	if (localStorage.hasOwnProperty('unreadCount')) {
		icon = iconEnabled;
		badgeBkgColor = badgeBackgroundColorEnabled;
		badgeText = localStorage.unreadCount;
		if (badgeText == "0") {
			badgeText = "";
		}
	}

	chrome.browserAction.setIcon(icon);
	chrome.browserAction.setBadgeBackgroundColor(badgeBkgColor);
	chrome.browserAction.setBadgeText({text: badgeText});
}

/************* End icon update method ****************************/

/************* Check unread methods ******************************/

function getUnreadCount() {
	console.log("Updating unread count...");
	var xhr = new XMLHttpRequest();
	var abortTimerId = window.setTimeout(function() {
		xhr.abort();
	}, requestTimeout);

	function onFinished() {
		window.clearTimeout(abortTimerId);
		updateIcon();
	}

	function handleSuccess(count) {
		console.log("Update finished successfully");
		localStorage.unreadCount = count;
		onFinished();
	}

	var invokedErrorCallback = false;
	function handleError(error) {
		var errorMsg = "Error updating unread count";
		if (error) {
			errorMsg += " : "+error;
		}
		console.log(errorMsg);
		delete localStorage.unreadCount;
		onFinished();
		invokedErrorCallback = true;
	}
	
	try {
		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) {
				return;
			}

			if (xhr.status === 200 && xhr.responseText) {
				var response = JSON.parse(xhr.responseText);
				handleSuccess(response.unread);
				return;
			}

			handleError();
		};

		xhr.onerror = function(error) {
			handleError();
		};

		xhr.open("GET", getUnreadCountUrl(), true);
		xhr.send(null);
	} catch (e) {
		handleError(e);
	}
}

/************* End check unread methods  *************************/

/************* Listener methods **********************************/

function scheduleRequest() {                                                
	console.log("Creating refresh alarm");                                  
	chrome.alarms.create("refresh", {periodInMinutes: checkPeriodInMinute});
}                                                                           

function onWatchdog() {
	chrome.alarms.get("refresh", function(alarm) {
		if (!alarm) {
			console.log("Watchdog create refresh alarm");
			scheduleRequest();
			getUnreadCount();
		}
	});
}

function onInit() {
	console.log("Initializing extension");
	scheduleRequest();
	chrome.alarms.create("watchdog", {periodInMinutes: 5});
}

function onAlarm(alarm) {
	if (alarm && alarm.name == "watchdog") {
		onWatchdog();
	} else {
		getUnreadCount();
	}
}

function onTabUpdated(tabId, details) {
	if (details.url && isSelfossUrl(details.url)) {
	    console.log("Selfoss tab updated");
		localStorage.tabId = tabId;
	    getUnreadCount();
	}
}

function onTabRemoved(tabId, details) {
	if (tabId == localStorage.tabId) {
		console.log("Selfoss tab removed");
		getUnreadCount();
		delete localStorage.tabId;
	}
}

/************* End listener methods ******************************/

/************* Browser action methods ****************************/

function goToSelfoss() {
	if (!localStorage.hasOwnProperty("selfossUrl") || localStorage.selfossUrl == "") {
		chrome.tabs.create({url: "options.html"});
		return;
	}
	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (tab.url && isSelfossUrl(tab.url)) {
				console.log("Reopening Selfoss tab");
				chrome.tabs.update(tab.id, {selected: true});
				return;
			}
		}
		console.log("Opening Selfoss in a new tab");
		chrome.tabs.create({ url: getSelfossUrl(false) });
	});
}

/************ End browser action methods ************************/

/************ Set listener *************************************/

chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.browserAction.onClicked.addListener(goToSelfoss);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.runtime.onStartup.addListener(getUnreadCount());
