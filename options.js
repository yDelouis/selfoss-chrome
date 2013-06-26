
// Saves options to localStorage.
function save_options() {
	var selfossUrl = document.getElementById("url").value;
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

	localStorage.selfossUrl = selfossUrl;
	localStorage.username = username;
	localStorage.password = password;

	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {
		status.innerHTML = "";
	}, 1500);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var urlInput = document.getElementById("url");          
	var usernameInput = document.getElementById("username");
	var passwordInput = document.getElementById("password");
	
	if (localStorage.selfossUrl) {
		urlInput.value = localStorage.selfossUrl;
	}
	if (localStorage.username) {
		usernameInput.value = localStorage.username;
	}
	if (localStorage.password) {
		passwordInput.value = localStorage.password;
	}
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('nav-save').addEventListener('click', save_options);
