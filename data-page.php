<html>
<head>
<title>Football | Home | Data</title>
<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="bootstrap/css/font-awesome.css" />
<link rel="stylesheet" href="css/c3.min.css" />
<link rel="stylesheet" href="css/custom.css" />
<link rel="icon" href="images/football-icon1.png" />
<style>
	body {
	    width: 1200px;
	    margin: auto;
	    padding: 0px;
    }
    .match-title, .time-bar, .status-bar {
    	margin-left: 50px;
	    padding-top: 15px;
	    padding-bottom: 15px;
	    
    }
    .match-title, .time-bar {
    	color: rgb(255, 254, 254);
	    font-size: 14px;
    }
    .status-bar {
    	font-size: 14px;
    	color: lightsteelblue;
    }
    .match-name, .chart-title {
    	text-align: center;
    	font-weight: bold;
    }

    #data-section > div:last-of-type {
    	margin-right: 0 !important;
    }
    .custom-chart {
		padding: 10px; border: 1px solid; background: white;width: 1200px;
		position: relative;
	    
	}
	.betfair-chart {
		width: 1200px; padding: 10px; background: white; border: 1px solid;
	}
	.c3-circle {
		opacity: 0 !important;
	}
	.custom-chart, .betfair-chart {
		display: none;
		margin-bottom: 10px;
	}
	.top-border {
		border-top: 1px solid black !important;
	}
	.right-border {
		border-right: 1px solid black !important;
	}
	.major-tick {
      	stroke-width: 3px;
      	stroke-dasharray: 10,4;
	}
	.chartLinks {
		position: absolute;
		right: 150px;
    	top: 42px;
	}
	.chart-menu li {
		display: block;
	    float: left;
	    margin: 0 0 0 7px;
	    position: relative;
	}
	.chart-menu a {
		color: #007eaa;
    	text-decoration: none;
    	padding: 3px 4px;
	}
	.chart-menu li.active a {
	    background-color: #2481a2;
    	color: #fff;
	}

</style>
<!-- <script src="js/d3.v4.min.js"></script>
<script src="js/c3.min.js"></script> -->
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
					<li>
						<a href="index.jsp">
							<img src="images/football-icon1.png" alt=""> Football
						</a>
					</li>
					<li class="match-title"></li>
					<li class="time-bar"></li>
					<li class="status-bar">Extension is not working.</li>
				</ul>
				<div class="led-button led-red" style="float: right;  margin-right: 20px;">No Auth</div>
			</div>
			<!-- /.navbar-collapse -->
		</div>
		<!-- /.container-fluid -->
	</nav>
	<!-- Navbar End-->

	<div class="body">		
		
		<div id="table-section" class="">			
		</div>
		<div id="graph-section" class="" style="">	
			<div id="custom_chart_section" style="overflow-y: auto; margin-top: 20px;">
				<div id="customchart0" class="custom-chart">
					<div class="chartLinks">
                     <ul class="chart-menu">                        
                     </ul>
                   	</div>
				</div>
				<div id="customchart2" class="custom-chart">
					<div class="chartLinks">
                     <ul class="chart-menu">
                        
                     </ul>
                   	</div>
				</div>
				<div id="customchart1" class="custom-chart">
					<div class="chartLinks">
                     <ul class="chart-menu">
                        
                     </ul>
                   	</div>
				</div>
			</div>
			<div id="betfair_chart_section" style="overflow-y: auto; margin-top: 20px;">
				<div id="betfair_chart0" class="betfair-chart">
					<div class="match-name"></div>
					<div id="chart-title0" class="chart-title"></div>
					<div id="linechart0"></div>
					<div id="barchart0"></div>	
				</div>
				<div id="betfair_chart2" class="betfair-chart">
					<div class="match-name"></div>
					<div id="chart-title2" class="chart-title"></div>
					<div id="linechart2"></div>
					<div id="barchart2"></div>	
				</div>
				<div id="betfair_chart1" class="betfair-chart">
					<div class="match-name"></div>
					<div id="chart-title1" class="chart-title"></div>
					<div id="linechart1"></div>
					<div id="barchart1"></div>	
				</div>						
			</div>
		</div>
		<div id="data-section" class="" style="height: 550px; margin-top: 20px;">
		</div>
		<div id="loading" style="text-align: center;clear: both;">
			<img src="images/loading.gif" alt="Loading" height="100px" />
		</div>
		
	</div>
	<script src="bootstrap/js/jquery.min.js"></script>
	<script src="bootstrap/js/bootstrap.min.js"></script>
	
	<script>
		
	</script>
</body>
</html>