var selfossUrl = "http://selfoss.ydelouis.fr";

var iconEnabled = {path: "selfoss_enabled.png"};
var iconDisabled = {path: "selfoss_disabled.png"};
var badgeBackgroundColorEnabled = {color: [190, 190, 190, 230]};
var badgeBackgroundColorDisabled = {color: [208, 0, 24, 255]};

var requestTimeout = 2 * 1000;
var enabledImage = document.getElementById('enabled');
var canvas = document.getElementById('canvas');

/************** Common methods ************************************/

function getSelfossUrl() {
	return selfossUrl;
}

function getUnreadCountUrl() {
	return getSelfossUrl() + "/stats";
}

function isSelfossUrl(url) {
	return url.indexOf(getSelfossUrl()) === 0;
}

/************* End commons methods *******************************/

/************* Icon update method ********************************/

function updateIcon() {
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
	chrome.browserAction.setBadgeText(badgeText);
}

/************* End icon update method ****************************/

/************* Check unread methods ******************************/

function scheduleRequest() {

}

function getUnreadCount() {
	var xhr = new XMLHttpRequest();
	var abortTimerId = window.setTimeout(function() {
		xhr.abort();
	}, requestTimeout);

	function onFinished() {
		window.clearTimeout(abortTimerId);
		updateIcon();
	}

	function handleSuccess(count) {
		localStorage.unreadCount = count;
		localStorage.requestFailureCount = 0;
		onFinished();
	}

	var invokedErrorCallback = false;
	function handleError() {
		++localStorage.requestFailureCount;
		onFinished();
		invokedErrorCallback = true;
	}

	try {
		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) {
				return;
			}

			if (xhr.responseXML) {
				var response = JSON.parse(xhr.responseXML);
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
		console.error(chrome.i18n.getMessage("unreadcheck_exception", e));
		handleError();
	}
}

function startRequest(params) {
	if (params && params.scheduleRequest) {
		scheduleRequest();
	}
	getUnreadCount();
}

/************* End check unread methods  *************************/

/************* Browser action methods ****************************/

function goToSelfoss() {
	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (tab.url && isSelfossUrl(tab.url)) {
				chrome.tabs.update(tab.id, {selected: true});
				startRequest();
				return;
			}
		}
		chrome.tabs.create({ url: getSelfossUrl() });
	});
}

/************ End browser action methods ************************/

/************ Set listener *************************************/

chrome.browserAction.onClicked.addListener(goToSelfoss);
