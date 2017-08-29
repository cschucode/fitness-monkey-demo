$(function(){

	setInterval(memberCount, 1000);
	var $signupBtn = $('#signupBtn');

	// hide all pages except for the login page
	// $('.page').hide();
	$('#login-page').show();
	$('#navElements').hide();

	// Page one signup button takes user to membership signup page

	$('#signupBtn').on('click', function(){
		$('#login-page').hide();
		$('#memberSignup').show();
	});

	// submit member form and return to login page
	$('#submitBtn').on('click', function(e){
		e.preventDefault;
		$('#memberSignup').hide();
		$('#login-page').show();
	})

	$('#loginBtn').on('click', function(e){
		var username = $('#username').val();
		localStorage.setItem('username', username);
	})

	var name = localStorage.getItem('username') || 'Nuke';
	$('#member-name').text(name);

});

// Random member count generator
function memberCount(){
	var $count = $('.num');
	var random = Math.floor(Math.random() * 100);

	var currentCount = Number(removeCommas($count.text()));
	currentCount += random;
	currentCount = addCommas(currentCount);

	$count.text(currentCount);
};
// adds commas to member counts
function addCommas(number){
	var strNum = number.toString();
	var splitStr = strNum.split('');

	for (var i = splitStr.length - 1, count = 1; i >= 0; i--, count++) {
		if(count % 3 === 0){
			splitStr.splice(i, 0, ',');
		}
	}
	if(splitStr[0] === ','){
		splitStr.splice(0, 1);
	}
	return splitStr.join('');
};
// removes commas from member count text
function removeCommas(string){
	return string.split(',').join('');
};
