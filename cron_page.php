<html>
<head>
<title>Football | Home</title>
<link rel="icon" href="images/football-icon1.png" />

	<script src="js/custom.js"></script>
	<script>
	setInterval(function() {		
		console.log('requested');
		$.ajax({
			url: 'get_match_list.php',
			type: "GET",
			dataType: "json"
		}).done(function(res) {
			console.log('success');			
		})
	}, 60000);	
	</script>
</body>
</html>