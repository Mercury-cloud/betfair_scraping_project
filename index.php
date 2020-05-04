<html>
<head>
<title>Football | Home</title>
<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="bootstrap/css/font-awesome.css" />
<link rel="stylesheet" href="css/custom.css" />
<link rel="icon" href="images/football-icon1.png" />
<style>
	body {
	    width: 1200px;
	    margin: auto;
	    padding: 0px;
    }
	.top-border {
		border-top: 1px solid black !important;
	}
	.right-border {
		border-right: 1px solid black !important;
	}
	tr {
		height: unset !important;
	}
	td {
		line-height: unset !important;
		padding: 0 !important;
	}
	table {
		margin-bottom: 10px !important;
	}

	.time-bar, .status-bar {
    	margin-left: 50px;
	    padding-top: 15px;
	    padding-bottom: 15px;
	    
    }
    .time-bar {
    	color: rgb(255, 254, 254);
	    font-size: 14px;
    }
    .status-bar {
    	font-size: 14px;
    	color: lightsteelblue;
    }
</style>
<script type="text/javascript">/* 
	document.addEventListener('scroll', function(event) {
		if (document.body.scrollHeight == document.body.scrollTop
				+ window.innerHeight) {
			getData(true);
		}
	}); */
</script>
</head>
<body onload="">
	<div class="header">
		<a href="index.php"><img src="images/graphbysospeso.png" alt="Logo"  style="width: 200px;"/></a>
	</div>
	<!-- Navbar Start-->
	<nav class="navbar navbar-default">
		<div class="container-fluid">
			<!-- Brand and toggle get grouped for better mobile display -->
			<div class="navbar-header">
				<button type="button" class="navbar-toggle collapsed"
					data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"
					aria-expanded="false">
					<span class="sr-only">Toggle navigation</span> <span
						class="icon-bar"></span> <span class="icon-bar"></span> <span
						class="icon-bar"></span>
				</button>
			</div>

			<!-- Collect the nav links, forms, and other content for toggling -->
			<div class="collapse navbar-collapse"
				id="bs-example-navbar-collapse-1">
				<ul class="nav navbar-nav">
					<li><a href="index.jsp"><img
							src="images/football-icon1.png" alt=""> Football</a></li>
					<li class="time-bar"></li>
					<li class="status-bar">Extension is not working.</li>					
				</ul>
				<div class="led-button led-red" style="float: right; margin-right: 20px;">No Auth</div>
			</div>

			
			<!-- /.navbar-collapse -->
		</div>
		<!-- /.container-fluid -->
	</nav>
	<!-- Navbar End-->

	<div class="body">
		<div class="row betting">
			<div class="col-sm-3 football-title">
				<img src="images/football-icon1.png" alt="" class="football-image">
				Football
			</div>
			<div class="col-sm-9"></div>
		</div>
		<div id="match_table" class="table-responsive">
			<table
				class="table table-resonsive table-bordered table-striped table-hover"
				style="width: 1800px">
				<thead>
					<tr class="table-header1" style="line-height: 2px;">
						<td colspan="5"></td>
						<td colspan="4">Abbinate</td>
						<td colspan="6">Quote Attuali</td>
						<td colspan="3">Quote in base al Volume abbinato</td>						
					</tr>
					<tr class="table-header2">
						<td colspan="5" rowspan="2">League</td>
						<td>Totali</td>
						<td>1</td>
						<td>X</td>
						<td>2</td>
						<td colspan="2">1</td>
						<td colspan="2">X</td>
						<td colspan="2">2</td>
						<td>1</td>
						<td>X</td>
						<td>2</td>
					</tr>
					<tr class="table-header3">
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td>Punta</td>
						<td>Banca</td>
						<td>Punta</td>
						<td>Banca</td>
						<td>Punta</td>
						<td>Banca</td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
					<tr class="table-header4">
						<td colspan="5"></td>
						<td colspan="4"></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td colspan="3"></td>												
					</tr>
					
				</thead>
			</table>
		</div>
	<div id="loading" style="text-align: center;clear: both;">
				<img src="images/loading.gif" alt="Loading" height="100px" />	
	<script src="bootstrap/js/jquery.min.js"></script>
	<script src="bootstrap/js/bootstrap.min.js"></script>
	<script src="js/custom.js"></script>
	<script>
		setInterval(function() {		
		console.log('requested');
		$.ajax({
			url: 'scrap.php',
			type: "GET",
			dataType: "json"
		}).done(function(res) {
			console.log('success', res);			
		})
	}, 60000);		
	</script>
</body>
</html>