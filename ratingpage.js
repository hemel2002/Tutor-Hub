// To access the stars
let stars = 
	document.getElementsByClassName("star");
let output = 
	document.getElementById("output");

// Funtion to update rating
function gfg(n) {
	remove();
	for (let i = 0; i < n; i++) {
		if (n == 1) cls = "one";
		else if (n == 2) cls = "two";
		else if (n == 3) cls = "three";
		else if (n == 4) cls = "four";
		else if (n == 5) cls = "five";
		stars[i].className = "star " + cls;
	}
	output.innerText = "Rating is: " + n + "/5";
}

// To remove the pre-applied styling
function remove() {
	let i = 0;
	while (i < 5) {
		stars[i].className = "star";
		i++;
	}
}
document.getElementById('submit-comment').addEventListener('click', function () {
	const commentInput = document.getElementById('comment-input');
	const usernameInput = document.getElementById('username-input');
	const commentList = document.getElementById('comment-list');
  
	// Get input values
	const commentText = commentInput.value.trim();
	const username = usernameInput.value.trim();
  
	if (commentText && username) {
	  // Create a new list item for the comment
	  const commentItem = document.createElement('li');
	  commentItem.innerHTML = `<strong>${username}:</strong> ${commentText}`;
  
	  // Add the new comment to the comment list
	  commentList.appendChild(commentItem);
  
	  // Clear the input fields
	  commentInput.value = '';
	  usernameInput.value = '';
	} else {
	  alert('Please enter both your name and a comment.');
	}
  });
  