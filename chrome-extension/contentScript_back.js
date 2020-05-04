if (document.location.href.includes('www.betfair.it/exchange/plus/football')== true) {		// code for betfair.it
	
	var timer = setInterval(main, 10000);
	main();


	function main() {
		console.log('extension working');
		if (document.location.href.includes('www.betfair.it/exchange/plus/football')== true) {
			// console.log('X-Authenticatioin', getXAuthentication());
			xAuthentication = getXAuthentication();
			console.log('X-Authentication', xAuthentication);
			getXApplication();
		}
	}

	function getXApplication() {
		var url='https://www.betfair.it/exchange/graphs/#/1.153757405/55190/0';
		Http = new XMLHttpRequest();	
		Http.open("GET", url);
		Http.send();
		Http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				str = this.responseText;
				if(str.length > 10) {
					str = rmStrBeforeKeyword(str, 'angular.module');
					str = rmStrBeforeKeyword(str, 'appId');
					xApplication = getSubstrBetweenKeywords(str, "'", "'");
					console.log('X-Application', xApplication);	
		
					str = rmStrBeforeKeyword(str, 'seriesPageSize');
					pageSize = getSubstrBetweenKeywords(str, ":", "}").trim();
					console.log('pageSize', pageSize);
				}		
			}
		}
	}

	function getXAuthentication() {
		t = 'ssoid';
	    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + t.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")); 
	}

	matchList = [];
	marketIdArr = [];
	

	clusterSize = 5;
	detailedData = {};
	graphData = {};
	function getDetailedData() {
		detailedData = {};
		var cur_cnt = 0;
		var loop_cnt = Math.ceil(marketIdArr.length / clusterSize);
		var marketIds, subArr;
		for(i=0; i<loop_cnt; i++) {
			if(i != loop_cnt-1) {
				subArr = marketIdArr.slice(i * clusterSize, (i+1)*clusterSize)
			} else {
				subArr = marketIdArr.slice(i * clusterSize);
			}
			var marketIds = subArr.join(',');
			var url='https://www.betfair.it/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&currencyCode=EUR&locale=it&marketIds=' + marketIds + '&rollupLimit=2&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST,RUNNER_DESCRIPTION';
			// console.log('marketIds', marketIds);
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json"
			}).done(function(res) {
				// console.log('detail-', res);		
				var eventNodes = res.eventTypes[0].eventNodes;
				if(eventNodes.length > 0) {
					eventNodes.forEach(function(d) {
						detailedData[d.eventId] = d;
					});
				}			
				if(cur_cnt/2 == loop_cnt-1) {
					sendData();							
				}
				cur_cnt++;
			});

			var url1='https://www.betfair.it/api/sports/exchange/readonly/v1.0/bymarket?alt=json&currencyCode=EUR&locale=it&marketIds=' + marketIds + '&rollupLimit=2&rollupModel=STAKE&ts='+ new Date().getTime() + '&types=EVENT,MARKET_DESCRIPTION,RUNNER_DESCRIPTION,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_ALL,RUNNER_EXCHANGE_TRADED,RUNNER_SP_TAKEN&virtualise=true ';
			Http = new XMLHttpRequest();	
			Http.open("GET", url1);
			Http.setRequestHeader('X-Application', xApplication);
			Http.setRequestHeader('X-Authentication', xAuthentication);
			Http.send();
			Http.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {				
					var response = jQuery.parseJSON(this.responseText);
					var eventNodes = response.eventTypes[0].eventNodes;
					if(eventNodes.length > 0) {
						eventNodes.forEach(function(d) {
							graphData[d.eventId] = d;
						});
					}			
					if(cur_cnt/2 == loop_cnt-1) {
						sendData();
					}
					cur_cnt++;
				}
			}
		}
	}

	function sendData() {
		console.log('total', Object.keys(detailedData).length);
		console.log(detailedData);
		console.log('total graph', Object.keys(graphData).length);
		console.log(graphData);
		console.log('SENT Detail data');

		chrome.runtime.sendMessage({destination: destinationUrl, payload: {matchList: matchList, detailedData: detailedData, graphData: graphData, pageSize: pageSize}}, function(response) {});
	}

	// Communication
	// destinationUrl = "http://localhost/public_html/PHP/betfair/pre-betfair.com/*";
	var destinationUrl = "http://localhost/public_html/PHP/betfair/dataviz.betfair.it/site/*";
	

	// communication
	// setInterval(function() {
	// 	window.postMessage({action: 'GOT_DUCK', payload: 'duck'}, '*');	
	// }, 3000);


	window.addEventListener('message', function (event) {	
		console.log('Message arrived from JS.');	
	   	chrome.runtime.sendMessage({destination: destinationUrl, payload: event.data}, function(response) {});
	}, false);

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	    // console.log(sender.tab ?
	    //             "from a content script:" + sender.tab.url :
	    //             "from the extension");    
		console.log('RECEIVED Match LIST');	    
	    matchList = request.payload;
	    marketIdArr = [];
	    for(i=0; i < matchList.length; i++) {
			marketIdArr.push(matchList[i].marketId);
		}
		console.log('marketIdArr', marketIdArr);   
		getDetailedData();
	});
} // End code for betfair.it


if (document.location.href.includes('dataviz.betfair.it/site')== true) {		// code for dataviz.betfair.it
	window.addEventListener('message', function (event) {	
		console.log('Message arrived from JS.');	
	   	// chrome.runtime.sendMessage({destination: destinationUrl, payload: event.data}, function(response) {});
	}, false);
	var data, chartData;
	var pageSize;
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	    // console.log(sender.tab ?
	    //             "from a content script:" + sender.tab.url :
	    //             "from the extension");    
	    // console.log('received message', request); 
	    // loadMeanMatchPage();
	    console.log('RECEIVED Detail Data');
	    // sessionStorage.setItem('data', JSON.stringify(request.payload));	    
	});

	var destinationUrl = "https://www.betfair.it/exchange/plus/football/today";
	getMatchList();
	var timer = setInterval(getMatchList, 10000);
	function getMatchList() {
		var url='http://www.vizit.betfairliveodds.com/get_match_list.php';
		$.ajax({
			url: url,
			type: "GET",
			dataType: "json"
		}).done(function(res) {
			var matchList = res.data;
			if(res.data.length > 0) {
				console.log('Sent Match List');
				chrome.runtime.sendMessage({destination: destinationUrl, payload: matchList}, function(response) {});	
			}
		});
	}

	var selectionIds = [];
	var selectionCnt = 0;
	var chart_data = [];
	if(sessionStorage.getItem('data') != undefined) {
		data = jQuery.parseJSON(sessionStorage.getItem('data'));	
		pageSize = data.pageSize;
		if(document.location.href.includes('dataviz.betfair.it/site/data-page.php')== true) {	// 2nd Page
			loadDataPage(29103381, 1.154370369);
		} else {	// 1st Page		
			loadMeanMatchPage();
		}
	}

	// //////// 1st Page //////////
	function loadMeanMatchPage() {		
		console.log(data);

		var originalCount = $('#match_table > table').length;
		console.log('---------------------');
		console.log('original', originalCount);
		console.log('updated', data.matchList.length);
		if(data.matchList.length == 0) return;
		var addedCnt = 0;
		var available_count = 0;
		for(i=0; i < data.matchList.length; i++) {
			var match = data.matchList[i];
			var dData, runners, back=['', '', ''],lay=['', '', ''];						

			if(data.detailedData[match.eventId] == undefined) continue;
			available_count++;
			dData = data.detailedData[match.eventId];

			if(checkPropInObj(dData,['marketNodes', 0, 'runners'])) {
				runners = dData.marketNodes[0].runners;	
			}	
			var matched = ['', '', ''], total='';
			var unit=['', '', '']; 

			if(runners != undefined) {
				$total = 0;
				for(var j=0; j<3; j++) {
					if(checkPropInObj(runners, [j, 'exchange', 'availableToBack', 0, 'size'])) back[j] = runners[j].exchange.availableToBack[0].size;
					if(checkPropInObj(runners, [j, 'exchange', 'availableToLay', 0, 'size'])) lay[j] = runners[j].exchange.availableToLay[0].size;					

					if(checkPropInObj(runners, [j, 'state', 'totalMatched'])) matched[j] = (runners[j].state.totalMatched).toFixed(2);
					if(matched[j] != '') total = total*1 + matched[j]*1;
				}				
				for(var j=0; j<3; j++) {
					if(matched[j] != '' && matched[j] != 0) unit[j] = (total / matched[j]).toFixed(2);	
				}
			}
			
			var recHtml = '';
			var leagueHtml = '<div>' + match.league + '</div>';
			leagueHtml += '<div>' + match.startTime + '</div>';
			leagueHtml += '<div>' + match.matchName + '</div>';
			recHtml += '<table class="table table-resonsive table-bordered table-striped table-hover" id="data-table" style="width: 1800px">';
				recHtml += '<thead>';
					recHtml += '<tr class="table-header1" style="line-height: 2px;">';
						recHtml += '<td width="16%" colspan="5" class="no-left no-top no-back"></td>';
						recHtml += '<td width="26%" colspan="4">Abbinate</td>';
						recHtml += '<td width="32%" colspan="6">Quote Attuali</td>';
						recHtml += '<td width="26%" colspan="3">Quote in base al Volume abbinato</td>';
					recHtml += '</tr>';
					recHtml += '<tr class="table-header2">';
						recHtml += '<td colspan="5" rowspan="2" event-id="' + match.eventId +'" market-id="' + match.marketId + '" onclick="openDataPage(' + match.marketId + ', ' + match.eventId + ')">' + leagueHtml + '</td>';
						recHtml += '<td>Totali</td>';
						recHtml += '<td>1</td>';
						recHtml += '<td>X</td>';
						recHtml += '<td>2</td>';
						recHtml += '<td colspan="2">1</td>';
						recHtml += '<td colspan="2">X</td>';
						recHtml += '<td colspan="2">2</td>';
						recHtml += '<td>1</td>';
						recHtml += '<td>X</td>';
						recHtml += '<td>2</td>';
					recHtml += '</tr>';
					recHtml += '<tr class="table-header3">';
						recHtml += '<td>' + total + '</td>';
						recHtml += '<td>' + matched[0] + '</td>';
						recHtml += '<td>' + matched[2] + '</td>';
						recHtml += '<td>' + matched[1] + '</td>';
						recHtml += '<td class="back">Punta</td>';
						recHtml += '<td class="lay">Banca</td>';
						recHtml += '<td class="back">Punta</td>';
						recHtml += '<td class="lay">Banca</td>';
						recHtml += '<td class="back">Punta</td>';
						recHtml += '<td class="lay">Banca</td>';
						recHtml += '<td>' + unit[0] + '</td>';
						recHtml += '<td>' + unit[2] + '</td>';
						recHtml += '<td>' + unit[1] + '</td>';
					recHtml += '</tr>';
					recHtml += '<tr class="table-header4">';
						recHtml += '<td colspan="5" class="no-left no-bottom no-back no-right"></td>';
						recHtml += '<td colspan="4" class="no-left no-bottom no-back"></td>';						
						recHtml += '<td class="back">' + back[0] + '</td>';
						recHtml += '<td class="lay">' + lay[2] + '</td>';
						recHtml += '<td class="back">' + back[1] + '</td>';
						recHtml += '<td class="lay">' + lay[0] + '</td>';
						recHtml += '<td class="back">' + back[2] + '</td>';
						recHtml += '<td class="lay">' + lay[1] + '</td>';
						recHtml += '<td colspan="3" class="no-bottom no-right no-back"></td>';
					recHtml += '</tr>';
				recHtml += '</thead>';
			recHtml += '</table>';

			if(i < originalCount) {
				$('#match_table > table').eq(i).replaceWith(
					recHtml);
			} else {	

				$('#match_table').append(recHtml);
				addedCnt++;
			}
		}

		var removedCnt = 0;
		if(available_count < originalCount) {						
			for(i = originalCount - 1; i >= available_count; i--) {
				$('#match_table > table').eq(i).remove();
				removedCnt++;
			}						
		}
		console.log('available count', available_count);
		console.log('REMOVED: ', removedCnt);
		console.log('ADDED: ', addedCnt);
		console.log('current', $('#match_table > table').length);


	}

	// //////// 2nd Page //////////
	
	function loadDataPage(event_id, market_id) {
		
		var dData = data.detailedData[event_id];
		var runners;
		if(checkPropInObj(dData,['marketNodes', 0, 'runners'])) {
			runners = dData.marketNodes[0].runners;	
		}	

		if(runners != undefined) {
			for(var i=0; i<3; i++) {
				if(checkPropInObj(runners, [i, 'selectionId'])) selectionIds[i] = runners[i].selectionId;
				if(selectionIds[i] != undefined) {
					selectionCnt++;
					
				}
			}
		}

		getChartData(market_id, 0);		

		console.log('data', data.graphData[event_id]);


		chartData = jQuery.parseJSON(sessionStorage.getItem('chart-data'));
		var openingOdds, lastOdds;
		if(chartData != undefined && chartData.series != undefined) {
			openingOdds = chartData.series[0][0];
			lastOdds = chartData.series[chartData.series.length-1][0];
		}

		// $.ajax({
		// 	type: "post",
		// 	url: "data-process.php",
		// 	dataType: "json",
		// 	data: {data: data.graphData[event_id], openingOdds: openingOdds, lastOdds: lastOdds},
		// 	success: function(res) {
		// 		$('#table-section').html(res.tables);
		// 	}
		// })
	}
	function openDataPage(marketId, eventId) {
		console.log('openDataPage');
		window.location.href = 'data-page.php?market=' + marketId + '&event=' + eventId;
	}

	function getChartData(market_id, i) {
		client = new XMLHttpRequest();
		client.open('GET', 'https://strands.betfair.it/api/ega/history/v1?hc=0&mId=' + market_id + '&pageSize=' + pageSize + '&sId=' + selectionIds[i]);
		client.setRequestHeader("Accept", "application/json, text/plain, */*");
		client.setRequestHeader('X-Application', 'WD5WvzdqTuLXyNo9');
		client.send();
		console.log('SENT REQUEST FOR GRAPH DATA' + i);

		client.onreadystatechange = function() {						
			if (this.readyState == 4 && this.status == 200) {		
				console.log('RECEIVED chart data ' + i);	
				chart_data[i] = client.responseText;
				console.log('chart_data', chart_data[i]);
				selectionCnt--;
				if(selectionCnt > 0) {
					getChartData(market_id, i+1);
				} else if(selectionCnt == 0) {
					console.log('END RECEIVED');
					sessionStorage.setItem('chart-data', chart_data);	  
				}
				// console.log('graph', client.responseText);
				// sessionStorage.setItem('chart-data', client.responseText);	  
			}
		}	
	}


} // End code for dataviz.betfair.it



// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Custom String Helper Functions
function rmStrBeforeKeyword(str, keyword) {
	var start = str.indexOf(keyword);	
	if (start == -1) return str;
	return str.substr(start);
}

function getSubstrBetweenKeywords(str, key1, key2) {
	var start = str.indexOf(key1);
	if(start == -1) return false;
	var end = str.indexOf(key2, start+1);	
	if(end == -1) return false;
	return str.slice(start+1, end);
}

// Custom Object/Array Property/Element Existency chech function
function checkPropInObj(obj, keys) {
	for(var i=0; i < keys.length; i++) {		
		if(obj[keys[i]] == undefined) {
			return false;
		}
		obj = obj[keys[i]];		
	}
	return true;
}

