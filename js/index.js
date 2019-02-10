$("#doc").click(function(){
	window.location = "doc.html";
});

$("#sub").click(function(){
	if($("#email").val() == "admin"  && $("#password").val() == "admin"){
		window.location = "try-me-publisher/index.html";
	}
});

$("#pat").click(function(){
	window.location = "try-me-subscriber/index.html";
});

