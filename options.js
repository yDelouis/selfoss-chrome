
// Saves options to localStorage.
function save_options() {
	var selfossUrl = document.getElementById("url").value;
	localStorage.selfossUrl = selfossUrl;

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
	
	if (localStorage.selfossUrl) {
		urlInput.value = localStorage.selfossUrl;
	}
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('nav-save').addEventListener('click', save_options);
