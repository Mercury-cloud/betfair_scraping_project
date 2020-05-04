

if (document.location.href.includes('www.betfair.it/exchange/plus/it/calcio-scommesse-1')== true) {		// code for betfair.it
	// Communication
	// var destinationUrl = "http://localhost/public_html/PHP/betfair/dataviz.betfair.it/site/*";	//local-dev
	// var destinationUrl = "http://dataviz.it.nicoladefontetipster.com/*";
	var destinationUrl = "http://localhost/dataviz.it/*";	//local-dev
	var sentLogoutNoti = false;

	var timer = setInterval(main, 60000);
	main();

	function main() {
		var switch_state = 'off';
		chrome.storage.sync.get('toggle', function(data) {
		  console.log('SWITCH', data.toggle);
		  switch_state = data.toggle;
		  if(switch_state == 'on') {
				main_process();
			}
		});
	}


	function main_process() {
		console.log('extension working');		
		if (document.location.href.includes('www.betfair.it/exchange/plus/it/calcio-scommesse-1')== true) {
			if($('.mod-login input[value="Accesso"]').is(':visible')) {
					// $('.mod-login input[value="Accesso"]').click();
				if(sentLogoutNoti == false) {
					chrome.runtime.sendMessage({destination: destinationUrl, payload: {notification: 'logout'}}, function(response) {});
					sentLogoutNoti = true;
					console.log('SENT LOGOUT MESSAGE');
				}
				
				setTimeout(main, 5000);
			}
			if($('.keep-alive-modal-dialog').is(':visible')) {
				console.log('SESSION OUT');
				$('.keep-alive-modal-dialog button.dialog-button').click();
				setTimeout(main, 5000);
			}
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
		console.log("Get from url sent!----https://www.betfair.it/exchange/graphs/#/1.153757405/55190/0")
		Http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				str = this.responseText;
				console.log('Get from url response---', str);
				if(str.length > 10) {
					str = rmStrBeforeKeyword(str, 'angular.module');
					console.log('Get from url substr1-----', str);

					str = rmStrBeforeKeyword(str, 'appId');
					console.log('Get from url substr2-----', str);

					xApplication = getSubstrBetweenKeywords(str, "'", "'");
					console.log('X-Application', xApplication);	
		
					str = rmStrBeforeKeyword(str, 'seriesPageSize');
					pageSize = getSubstrBetweenKeywords(str, ":", "}").trim();
					console.log('pageSize', pageSize);
					sendCredentialData()
				}		
			}
		}
	}

	function getXAuthentication() {
		t = 'ssoid';
	    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + t.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")); 
	}

	

	function sendCredentialData() {
		console.log('SENT CREDENTIAL');
		chrome.runtime.sendMessage({destination: destinationUrl, payload: {xApplication: xApplication, xAuthentication: xAuthentication, pageSize: pageSize}}, function(response) {});
	}

	
	
	


	window.addEventListener('message', function (event) {	
		console.log('Message arrived from JS.', event);	
	   	chrome.runtime.sendMessage({destination: destinationUrl, payload: event.data}, function(response) {});
	}, false);

	
} // End code for betfair.it


// if (document.location.href.includes('dataviz.betfair.it/site')== true) {		// code for dataviz.betfair.it 		//local-dev
// if (document.location.href.includes('dataviz.it.nicoladefontetipster.com')== true) {		// code for dataviz.betfair.it
if (document.location.href.includes('dataviz.it')== true) {		// code for dataviz.betfair.it 		//local-dev
	var data, chartData;
	var pageSize;
	var xApplication, xAuthentication;
	matchList = [];
	marketIdArr = [];
	eventIdArr = [];	
	clusterSize = 5;
	detailedData = {};
	graphData = {};
	matchData = {};
	var selectionIds = [];
	var selectionCnt = 0;
	var chart_data = [];
	var linechart = [], barchart = [];
	var startFlag = false;	
	var eventId, match_name, teams, openDate;


	var timer = setInterval(recursive_process, 60000);
	recursive_process();
	
	function recursive_process() {
		showStatus('');
		var switch_state = 'off';
		chrome.storage.sync.get('toggle', function(data) {
		  console.log('SWITCH', data.toggle);
		  switch_state = data.toggle;
		  if(switch_state == 'on') {
		  		checkAuth();
				getMatchList();
			} else {
				showStatus('Check if extension is switched on, please.')
			}
		});
		

	}

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	    // console.log(sender.tab ?
	    //             "from a content script:" + sender.tab.url :
	    //             "from the extension");    
	    console.log('RECEIVED MESSAGE', request.payload); 
	    if(!request.payload) return;
	    if(request.payload.notification != undefined && request.payload.notification == 'logout') {
	    	// alert('You\'ve been logged out from betfair. Please login betfair.');
	    } else {

		    xApplication = request.payload.xApplication;
		    xAuthentication = request.payload.xAuthentication;
		    pageSize = request.payload.pageSize;	    
		    console.log('RECEIVED CREDENTIAL');
		    console.log('xApplication', xApplication);
		    console.log('xAuthentication', xAuthentication);
		    var credential = {xApplication: xApplication, xAuthentication: xAuthentication, pageSize: pageSize};
		    localStorage.setItem('credential', JSON.stringify(credential));
		    if(startFlag == false) {
		    	checkAuth();
		    	getDetailedData();
		    }
		}

	});

	
	function getMatchList() {
		console.log('getMatchList', (Date.now() / 1000));
		// var url='http://dataviz.it.nicoladefontetipster.com/get_match_list.php';
		// var url='http://localhost/public_html/PHP/betfair/dataviz.betfair.it/site/get_match_list.php' 	//local-dev
		var url='http://localhost/dataviz.it/get_match_list.php' 	//local-dev
		$.ajax({
			url: url,
			type: "GET",
			dataType: "json"
		}).done(function(res) {
			matchList = res.data;
			// matchList = [{"eventId":"29768121","marketId":"1.170299857","league":"Bielorussia - Premier League","score":"0-2","timeElapsed":45,"startTime":"17\/04\/2020 18:30","matchName":"Shakhter Soligorsk v Slutsk","status":true,"matchstatus":"OPEN"}];
			
			console.log("got matchlist-----", matchList);
			if(matchList.length > 0) {
				marketIdArr = [];
				eventIdArr = [];
				for(i=0; i < matchList.length; i++) {
					marketIdArr.push(matchList[i].marketId);
					eventIdArr.push(matchList[i].eventId);
				}
				console.log("marketIdArr---mmmmmmmmmm-----", matchList);
				console.log("eventIdArr---eeeeeeee--", matchList);
				getDetailedData();
			} else {
				showStatus('No match to show.');
			}
		});
	}
	
	function getDetailedData() {
		console.log('---getDetailedData called!---');
		var credential = jQuery.parseJSON(localStorage.getItem('credential'));
		if(credential == undefined) {
			console.log('NO AUTHENTICATION');
			showStatus('No authentication exist, please check betfair login.');
			return;
		}
		xAuthentication = credential.xAuthentication;
		xApplication = credential.xApplication;

		if(xAuthentication == undefined || xApplication == undefined || xAuthentication == "" || xApplication == "") {
			console.log('NO AUTHENTICATION');
			showStatus('No authentication exist, please check betfair login.');
			return;
		}

		startFlag = true;

		detailedData = {};
		graphData = {};
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
			console.log('marketIds---', marketIds);
			var url='https://ero.betfair.it/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&currencyCode=EUR&locale=it&marketIds=' + marketIds + '&rollupLimit=2&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST';
			console.log('detailDatagetURLs---', url);
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json"
			}).done(function(res) {
				console.log('detailedData-------', res);		
				var eventNodes = res.eventTypes[0].eventNodes;
				if(eventNodes.length > 0) {
					eventNodes.forEach(function(d) {
						detailedData[d.eventId] = d;
					});
				}			
				if(cur_cnt/2 == loop_cnt-1) {
					saveData();
				}
				cur_cnt++;
			});

			var url1='https://ero.betfair.it/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=EUR&locale=it&marketIds=' + marketIds + '&rollupLimit=2&rollupModel=STAKE&ts=' + new Date().getTime() + '&types=EVENT,MARKET_DESCRIPTION,RUNNER_DESCRIPTION,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_ALL,RUNNER_EXCHANGE_TRADED,RUNNER_SP_TAKEN&virtualise=true';			
			// chrome.runtime.sendMessage({url: url1, xApp: xApplication, xAuth: xAuthentication}, function(res) {
				// var response = jQuery.parseJSON(res);
				// console.log('graphData---------', response);		
				// var eventNodes = response.eventTypes[0].eventNodes;
				// console.log("eventNodes----", eventNodes);
				// if(eventNodes.length > 0) {
				// 	eventNodes.forEach(function(d) {
				// 		graphData[d.eventId] = d;
				// 		console.log('graphData_each_d.eventId-----', graphData[d.eventId]);
				// 	});
				// }			
				// if(cur_cnt/2 == loop_cnt-1) {
				// 	saveData();
				// }
				// cur_cnt++;
			// });
			// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			// 	console.log('requestdata----', request.data);
			// 	if(!request.data) return;
			// 	var response = jQuery.parseJSON(request.data);
			// 	console.log('graphData---------', response);		
			// 	var eventNodes = response.eventTypes[0].eventNodes;
			// 	console.log("eventNodes----", eventNodes);
			// 	if(eventNodes.length > 0) {
			// 		eventNodes.forEach(function(d) {
			// 			graphData[d.eventId] = d;
			// 			console.log('graphData_each_d.eventId-----', graphData[d.eventId]);
			// 		});
			// 	}			
			// 	if(cur_cnt/2 == loop_cnt-1) {
			// 		saveData();
			// 	}
			// 	cur_cnt++;
			// });
			Http = new XMLHttpRequest();	
			Http.open("GET", url1);
			Http.setRequestHeader('X-Application', xApplication);
			Http.setRequestHeader('X-Authentication', xAuthentication);
			// Http.setRequestHeader('Access-Control-Allow-Origin', '*');
			// Http.setRequestHeader('Access-Control-Allow-Methods', '*/*');
			Http.send();
			Http.onreadystatechange = function() {
			// 	if(this.readyState == this.HEADERS_RECEIVED) {

			// 	    // Get the raw header string
			// 	    var headers = Http.getAllResponseHeaders();

			// 	    // Convert the header string into an array
			// 	    // of individual headers
			// 	    var arr = headers.trim().split(/[\r\n]+/);

			// 	    // Create a map of header names to values
			// 	    var headerMap = {};
			// 	    arr.forEach(function (line) {
			// 	      var parts = line.split(': ');
			// 	      var header = parts.shift();
			// 	      var value = parts.join(': ');
			// 	      headerMap[header] = value;
			// 	    });

			// 	    const responseHeaders = details.responseHeaders.map(item => {
			// 		    if (item.name.toLowerCase() === 'access-control-allow-origin') {
			// 		      item.value = '*'
			// 		    }
			// 		  })
			// 		  return { responseHeaders };


			// 	  }

				if (this.readyState == 4 && this.status == 200) {				
					var response = jQuery.parseJSON(this.responseText);
					console.log('graphData---------', response);		
					var eventNodes = response.eventTypes[0].eventNodes;
					console.log("eventNodes----", eventNodes);
					if(eventNodes.length > 0) {
						eventNodes.forEach(function(d) {
							graphData[d.eventId] = d;
							console.log('graphData_each_d.eventId-----', graphData[d.eventId]);
						});
					}			
					if(cur_cnt/2 == loop_cnt-1) {
						saveData();
					}
					cur_cnt++;
				}
			}
		}
	}

	


	////////////////////// chart debug ///////////////////////////
		// 	data = jQuery.parseJSON(localStorage.getItem('data'));
		// 	var openDate = data.graphData[29104462].event.openDate;
		// 	var availability = jQuery.parseJSON(localStorage.getItem('availability'));
		// drawCustomChart('customchart0', availability['29104462'][0], openDate);
		// drawCustomChart('customchart1', availability['29104462'][1], openDate);
				
		
		// chartData = jQuery.parseJSON(localStorage.getItem('chart-data'));	
		// drawChart();
	///////////////////////////////////////////////	
	

	function saveData() {
		console.log('total', Object.keys(detailedData).length);
		console.log(detailedData);
		console.log('total graph', Object.keys(graphData).length);
		console.log(graphData);

		// data = {matchList: matchList, detailedData: detailedData, graphData: graphData};
		// localStorage.setItem('data', JSON.stringify(data));
		storeMoneyAvailability(graphData);	
		// if(document.location.href.includes('dataviz.betfair.it/site/data-page.php')== true) {	// 2nd Page  local-dev
		// if(document.location.href.includes('dataviz.it.nicoladefontetipster.com/data-page.php')== true) {	// 2nd Page
		if(document.location.href.includes('dataviz.it/data-page.php')== true) {	// 2nd Page  local-dev
			var url = new URL(window.location.href);
			reloadDataPage(url.searchParams.get("event"), url.searchParams.get("market"));
		} else {	// 1st Page		
			reloadMeanMatchPage();
		} 
	}

	function storeMoneyAvailability(graphData) {
		console.log('storeMoneyAvailability');
		var moneyAvailability = {};
		if(localStorage.getItem('availability') != undefined) {
			moneyAvailability= jQuery.parseJSON(localStorage.getItem('availability'));
			// console.log('moneyAvailability', moneyAvailability);
		} 

		eventIdsString = eventIdArr.join(',');
		console.log('eventIdsString', eventIdsString);
		for (key in moneyAvailability) {
			if(eventIdsString.includes(key) == false) {
				console.log('DELETE EVENT RECORD-' + key);
				delete moneyAvailability[key];
			}
		}

		// console.log('test', moneyAvailability);
		if(graphData.length == 0) return;
		var timeStamp = getRomeTime();

		for(id in graphData) {
			var record = [];
			if(checkPropInObj(graphData[id],['marketNodes', 0, 'runners'])) {
				runners = graphData[id].marketNodes[0].runners;								
			}
			if(runners != undefined) {
				for(var i=0; i<runners.length; i++) {
					if(moneyAvailability[id] != undefined && moneyAvailability[id][i] != undefined) {						
						record[i] = moneyAvailability[id][i];	
						// console.log('exist runners for custom chart', id, runners);	
					} else {
						record[i] = [];	
					}
					
					var subrecord = [];
					if(checkPropInObj(runners, [i, 'exchange', 'availableToBack'])) {
						var availableToBack = runners[i].exchange.availableToBack;
						var total_back = 0;
						for(var k=0; k<availableToBack.length; k++) {
							if(availableToBack[k].size != undefined) {
								total_back += availableToBack[k].size;
							}
						}
						if(total_back > 0) subrecord[0] = total_back.toFixed(2);
					}
					if(checkPropInObj(runners, [i, 'exchange', 'availableToLay'])) {
						var availableToLay = runners[i].exchange.availableToLay;
						var total_lay = 0;
						for(var k=0; k<availableToLay.length; k++) {
							if(availableToLay[k].size != undefined) {
								total_lay += availableToLay[k].size;
							}							
						}

						if(total_lay > 0) subrecord[1] = total_lay.toFixed(2);
					}		
					subrecord[2] = timeStamp;
					record[i].push(subrecord);
				}
				
			}			
			moneyAvailability[id] = record;
		}
		console.log('moneyAvailability', moneyAvailability);
		localStorage.setItem('availability', JSON.stringify(moneyAvailability));
	}

	// //////// 1st Page //////////
	function reloadMeanMatchPage() {
		console.log('reloadMeanMatchPage');
		// data = jQuery.parseJSON(localStorage.getItem('data'));
		// if(data == undefined || data.matchList == undefined) {
		// 	console.log("No Match Data");
		// 	return;
		// }			
		// console.log(data);

		var originalCount = $('#match_table > table').length;
		// console.log('---------------------');
		// console.log('original', originalCount);
		// console.log('updated', data.matchList.length);
		if(matchList.length == 0) {
			console.log('No Matches');			
			showStatus('Sorry, No match to show!');
			return;	
		} 
		var addedCnt = 0;
		var available_count = 0;
		for(i=0; i < matchList.length; i++) {			
			var match = matchList[i];
			var dData, runners, back=['', '', ''],lay=['', '', ''];						

			if(graphData != undefined && graphData[match.eventId] != undefined) {
				dData = graphData[match.eventId];
			} else if(detailedData != undefined && detailedData[match.eventId] != undefined) {
				dData = detailedData[match.eventId];
			}

			if(dData == undefined) {
				console.log('No Match Data');
				showStatus('Sorry, No match data from betfair!');
				continue;
			}
			available_count++;

			if(checkPropInObj(dData,['marketNodes', 0, 'runners'])) {
				runners = dData.marketNodes[0].runners;	
			}	
			var matched = ['', '', ''], total='';
			var unit=['', '', '']; 

			if(runners != undefined) {
				$total = 0;
				for(var j=0; j<3; j++) {
					if(checkPropInObj(runners, [j, 'exchange', 'availableToBack', 0, 'price'])) back[j] = runners[j].exchange.availableToBack[0].price;
					if(checkPropInObj(runners, [j, 'exchange', 'availableToLay', 0, 'price'])) lay[j] = runners[j].exchange.availableToLay[0].price;					

					if(checkPropInObj(runners, [j, 'state', 'totalMatched'])) matched[j] = (runners[j].state.totalMatched).toFixed(2);
					if(matched[j] != '') total = (total*1 + matched[j]*1).toFixed(2);
				}				
				for(var j=0; j<3; j++) {
					if(matched[j] != '' && matched[j] != 0) unit[j] = (total / matched[j]).toFixed(2);	
				}
				
			}
			
			var recHtml = '';
			var leagueHtml = '<div>' + (match.league == undefined ? '' : match.league) + '</div>';
			leagueHtml += '<div><span>' + match.startTime + '&nbsp; - &nbsp;</span>';
			leagueHtml += '<span>' + match.matchName + '</span></div>';
			recHtml += '<table class="table table-resonsive table-bordered table-striped table-hover" id="data-table" style="width: 1200px">';
				recHtml += '<thead>';
					recHtml += '<tr class="table-header1 top-border" style="line-height: 2px;">';
						recHtml += '<td width="28%" colspan="5" class="no-left no-top no-back"></td>';
						recHtml += '<td width="24%" colspan="4" >Abbinate</td>';
						recHtml += '<td width="30%" colspan="6">Quote Attuali</td>';
						recHtml += '<td width="18%" colspan="3" class="right-border">Quote in base al Volume abbinato</td>';
					recHtml += '</tr>';
					recHtml += '<tr class="table-header2">';
						recHtml += '<td colspan="5" rowspan="2" event-id="' + match.eventId +'" market-id="' + match.marketId + '"><a href="data-page.php?market=' + match.marketId + '&event=' + match.eventId + '" target="_blank">' + leagueHtml + '</a></td>';
						recHtml += '<td width="6%">Totali</td>';
						recHtml += '<td width="6%">1</td>';
						recHtml += '<td width="6%">X</td>';
						recHtml += '<td width="6%">2</td>';
						recHtml += '<td colspan="2" width="10%">1</td>';
						recHtml += '<td colspan="2" width="10%">X</td>';
						recHtml += '<td colspan="2" width="10%" class="right-border">2</td>';
						recHtml += '<td width="5%">1</td>';
						recHtml += '<td width="5%">X</td>';
						recHtml += '<td width="5%">2</td>';
					recHtml += '</tr>';
					recHtml += '<tr class="table-header3">';
						recHtml += '<td>' + (total != '' ? '&euro;' : '') + total + '</td>';
						recHtml += '<td>' + (matched[0] != '' ? '&euro;' : '') + matched[0] + '</td>';
						recHtml += '<td>' + (matched[2] != '' ? '&euro;' : '') + matched[2] + '</td>';
						recHtml += '<td>' + (matched[1] != '' ? '&euro;' : '') + matched[1] + '</td>';
						recHtml += '<td  width="5%" class="back">Punta</td>';
						recHtml += '<td  width="5%" class="lay">Banca</td>';
						recHtml += '<td  width="5%" class="back">Punta</td>';
						recHtml += '<td  width="5%" class="lay">Banca</td>';
						recHtml += '<td  width="5%" class="back">Punta</td>';
						recHtml += '<td  width="5%" class="lay">Banca</td>';
						recHtml += '<td>' + unit[0] + '</td>';
						recHtml += '<td>' + unit[2] + '</td>';
						recHtml += '<td>' + unit[1] + '</td>';
					recHtml += '</tr>';
					recHtml += '<tr class="table-header4">';
						recHtml += '<td colspan="5" class="no-left no-bottom no-back no-right"></td>';
						recHtml += '<td colspan="4" class="no-left no-bottom no-back"></td>';						
						recHtml += '<td class="back">' + back[0] + '</td>';
						recHtml += '<td class="lay">' + lay[0] + '</td>';
						recHtml += '<td class="back">' + back[2] + '</td>';
						recHtml += '<td class="lay">' + lay[2] + '</td>';
						recHtml += '<td class="back">' + back[1] + '</td>';
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
		// console.log('available count', available_count);
		// console.log('REMOVED: ', removedCnt);
		// console.log('ADDED: ', addedCnt);
		// console.log('current', $('#match_table > table').length);


	}

	function getMatchWithEventId(event_id) {
		var index = matchList.findIndex(function(d) {
			return d.eventId == event_id;
		});

		return matchList[index];
	}

	// //////// 2nd Page //////////
	
	
	function reloadDataPage(event_id, market_id) {
		console.log('reloadDataPage');
		// data = jQuery.parseJSON(localStorage.getItem('data'));
		if(detailedData[event_id] == undefined) {			
			if(graphData[event_id] == undefined) {
				console.log('No Match Data!');
				showStatus('Sorry, No match data from betfair!');
				return;	
			}			
		}

		eventId = event_id;
		var match = getMatchWithEventId(event_id);	
		console.log('match', match);
		console.log('matchList', matchList);
		$('.match-title').text(match.league + '    ---    ' + match.matchName + ' --- ' + match.startTime);

		match_name = match.matchName;
		teams = match_name.split(' v ');

		var dData;
		if(detailedData[event_id] != undefined) {			
			dData = detailedData[event_id];
		} else {
			dData = graphData[event_id];
		}
		
		var runners;
		if(checkPropInObj(dData,['marketNodes', 0, 'runners'])) {
			runners = dData.marketNodes[0].runners;	
		}	

		if(runners != undefined) {
			selectionCnt = 0;
			for(var i=0; i<3; i++) {
				if(checkPropInObj(runners, [i, 'selectionId'])) selectionIds[i] = runners[i].selectionId;
				if(selectionIds[i] != undefined) {
					selectionCnt++;
					
				}
			}
		}

		if(selectionCnt > 0) {
			getChartData(market_id, event_id, 0);			
		}
		
		getMatchData(event_id, market_id);
		
		console.log("event---", graphData[event_id].event);
		openDate = graphData[event_id].event.openDate;
		console.log("openDate---", openDate)
		var availability = jQuery.parseJSON(localStorage.getItem('availability'));

		
		// console.log('availability', availability);
		drawCustomChart('customchart0', availability[event_id][0], openDate, match_name, teams[0], 1);
		drawCustomChart('customchart1', availability[event_id][1], openDate, match_name, teams[1], 1);
		drawCustomChart('customchart2', availability[event_id][2], openDate, match_name, 'Pareggio', 1);

	}

	function ReloadCustomChart(selectionId, filter) {
		console.log('ReloadCustomChart', selectionId);
		var availability = jQuery.parseJSON(localStorage.getItem('availability'));
		drawCustomChart('customchart' + selectionId, availability[eventId][selectionId], openDate, match_name, teams[0], filter);
	}
	

	function getMatchData(event_id, market_id) {
		console.log('getDetailedData');
		var credential = jQuery.parseJSON(localStorage.getItem('credential'));
		if(credential == undefined) {
			console.log('NO CREDENTIAL!');
			return;
		}
		xAuthentication = credential.xAuthentication;
		xApplication = credential.xApplication;

		if(xAuthentication == undefined || xApplication == undefined || xAuthentication == "" || xApplication == "") {
			console.log('NO AUTHENTICATION');
			return;
		}
		console.log('credential', credential);

		var url1='https://ero.betfair.it/www/sports/exchange/readonly/v1.0/bymarket?alt=json&currencyCode=EUR&locale=it&marketIds=' + market_id + '&rollupLimit=2&rollupModel=STAKE&ts=' + new Date().getTime() + '&types=EVENT,MARKET_DESCRIPTION,RUNNER_DESCRIPTION,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_ALL,RUNNER_EXCHANGE_TRADED,RUNNER_SP_TAKEN&virtualise=true';
		Http = new XMLHttpRequest();	
		Http.open("GET", url1);
		Http.setRequestHeader('X-Application', xApplication);
		Http.setRequestHeader('X-Authentication', xAuthentication);
		Http.send();
		Http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {				
				var response = jQuery.parseJSON(this.responseText);
				var eventNodes = response.eventTypes[0].eventNodes;
				console.log('matchData----------------', eventNodes[0]);
				
				if(eventNodes[0] != undefined) {
					matchData = eventNodes[0];
					$.ajax({
						type: "post",
						url: "data-process.php",
						dataType: "json",
						data: {data: JSON.stringify(matchData)},
						success: function(res) {
							$('#table-section').html(res.tables);
							$('#data-section').html(res.charttables);
							$('.match-name').text(match_name);
							$('#chart_tbl0').text(teams[0]);
							$('#chart_tbl1').text(teams[1]);
							$('#chart_tbl2').text('Pareggio');
							
						}
					});
				}							
			}
		}
	}

	function getChartData(market_id, event_id, i) {
		console.log('getChartData');
		var credential = jQuery.parseJSON(localStorage.getItem('credential'));
		if(credential == undefined) {
			console.log('NO Credential!!!');
			return;
		}
		xApplication = credential.xApplication;
		pageSize = credential.pageSize;		
		if(xApplication == undefined || pageSize == undefined || xApplication == "" || pageSize == "") {
			console.log('No Credential !!!');
			return;
		}

		client = new XMLHttpRequest();
		// client.open('GET', 'https://ips.betfair.it/inplayservice/v1/scoresAndBroadcast?_ak=nzIFcwyWhrlwYMrh&hc=0&mId=' + market_id + '&pageSize=' + pageSize + '&sId=' + selectionIds[i]);
		client.open('GET', 'https://strands.betfair.it/api/ega/history/v1?hc=0&mId=' + market_id + '&pageSize=' + pageSize + '&sId=' + selectionIds[i]);
		client.setRequestHeader("Accept", "application/json, text/plain, */*");
		client.setRequestHeader('X-Application', 'WD5WvzdqTuLXyNo9');
		client.send();
		console.log('SENT REQUEST FOR GRAPH DATA' + i);

		client.onreadystatechange = function() {						
			if (this.readyState == 4 && this.status == 200) {		
				console.log('RECEIVED chart data ' + i, client.responseText);	
				chart_data[i] = jQuery.parseJSON(client.responseText);
				console.log('chart_data', chart_data[i]);
				selectionCnt--;
				if(selectionCnt > 0) {
					getChartData(market_id, event_id, i+1);
				} else if(selectionCnt == 0) {
					console.log('END RECEIVED');					
					// localStorage.setItem('chart-data', JSON.stringify(chart_data));	
					chartData = chart_data;
					$.ajax({
						type: "post",
						url: "chart-data.php",
						dataType: "json",
						data: {data: JSON.stringify(matchData), chartData: JSON.stringify(chart_data)},
						success: function(res) {
							$('#table-section').append(res.tables);
						}
					});  

					drawChart();
				}				
			}
		}	
	}

		
	function drawChart() {
		$('.match-name').text(match_name);
		$('#chart-title0').text(teams[0]);
		$('#chart-title1').text(teams[1]);
		$('#chart-title2').text('Pareggio');

		var _data = chartData;
		console.log('-----BETFAIR CHART DATA------', chartData);
		var series = [];
		for(var i=0; i<3; i++) {

			series[i] = [];
			// console.log(chartData[i].series.length);
			if(checkPropInObj(_data, [i, 'series'])) {

				var cnt = _data[i].series.length;
				for(var k=0; k<cnt; k++) {	
					if(checkPropInObj(_data, [i, 'series', k])) {
						series[i].push({'odds': _data[i].series[k][0], 'quote': _data[i].series[k][1], 'time': convertTime(_data[i].series[k][2], '+1')});	
					}					
				}

				// console.log('SERIES DATA FOR CHART ' + i, series[i]);
				if(series[i].length == 0) {
					console.log('NO DATA FOR BETFAIR CHART-' + i);
					showStatus('NO DATA FOR BETFAIR CHART');
					continue;
				}

				$('#betfair_chart' + i).css('display', 'block');

				linechart[i] = c3.generate({
					bindto: '#linechart' + i,
					size: {
					  width: 1100,
					  height: 200
					},
				    data: {
				        json: series[i],
					    keys: {
					    	x: 'time',
					      value: ['odds']
					    }
				    },
				    axis: {
				        x: {
				            type: 'timeseries',
				            tick: {
				                format: '%H:%M',
				                count: 10
				            }
				        }
				    },
				    tooltip: {
					  show: false
					},
					legend: {
					  hide: true
					  
					},
					grid: {       
				        y: {
				            show: true
				        }
				    },
				    padding: {
				        left: 50,
				    },
				});

				barchart[i] = c3.generate({
					bindto: '#barchart' + i,
					size: {
					  width: 1100,
					  height: 200
					},
				    data: {
				        json: series[i],
					    keys: {
					    	x: 'time',
					      value: ['quote']
					    },
					    type: 'bar'
				    },
				    axis: {
				        x: {
				            type: 'timeseries',
				            tick: {
				                format: '%H:%M',
				                count: 10
				            }
				        }
				    },
				    bar: {
				        width: {
				            ratio: 0.1 // this makes bar width 50% of length between ticks
				        }
				        // or
				        //width: 100 // this makes bar width 100px
				    },
				    tooltip: {
					  show: false
					},
					legend: {
					  hide: true
					  
					},
					grid: {       
				        y: {
				            show: true
				        }
				    },
				    padding: {
				        left: 50,
				    },
				});
				// console.log('series', i , series[i]);
			}
		}
		
	}

	function drawCustomChart(wrapper_id, _data, macthOpenDate, match_name, title, filter) {		
		console.log('drawCustomChart');
		if(_data == undefined || _data.length == 0) {
			console.log("No Data For Graph");				
			return;
		}

		$('#' + wrapper_id).css('display', 'block');
		console.log('-----CUSTOM CHART DATA------', _data);
		// console.log('_data', _data);
		console.log('openDate', macthOpenDate);

		$('#' + wrapper_id + ' .chart-menu').empty();
		var filterHtml = '<li><span>Filter:</span></li>' +  
						'<li class="filter" data-filter="1"><a href="javascript:void(0)">1H</a></li>' + 
                        '<li class="filter" data-filter="2"><a href="javascript:void(0)">2H</a></li>' + 
                        '<li class="filter" data-filter="5"><a href="javascript:void(0)">5H</a></li>' +
                        '<li class="filter" data-filter="24"><a href="javascript:void(0)">1D</a></li>';
        $('#' + wrapper_id + ' .chart-menu').html(filterHtml);
        $('#' + wrapper_id + ' li[data-filter=' + filter + ']').addClass('active');

        var selectionId = wrapper_id.replace('customchart', '');
        $('#' + wrapper_id + ' li.filter').unbind('click').bind('click', function() {
        	console.log('filter');
        	ReloadCustomChart(selectionId, $(this).data('filter'));
        });

		var margin = {top: 50, right: 20, bottom: 50, left: 50},
	    width = 1100 - margin.left - margin.right,
	    height = 420 - margin.top - margin.bottom;

		// Parse the date / time
		var	formatDate = d3.timeFormat("%H:%M");
		console.log('OPEN DATE', macthOpenDate);
		var openDate = new Date(macthOpenDate);
		var startTime = openDate.getTime();
		startTime = convertTime(startTime, "+1");
		// var hour = openDate.getUTCHours();
		// hour = (hour < 10) ? '0' + hour : hour;
		// var min = openDate.getUTCMinutes();
		// min = (min < 10) ? '0'+min : min; 
		// var startTime = hour  + ":" + min;
		console.log('startTime', openDate.getTime());

		var formatTime = d3.timeFormat("%H:%M");

		var x = d3.scaleBand()
          .range([0, width])
          .padding(0.8);
		var y = d3.scaleLinear()
          .range([height, 0]);

      	


		var xAxis = d3.axisBottom(x)			
	  		// .tickSize(10)
			.tickFormat(function (d, i) {
				
	          console.log('TICKS', ticks);
	          if(ticks > 28) {
	          	return (i % 2 == 0) ? formatTime(d) : "";	
	          } else {
	          	return formatTime(d);
	          }
	          
	        });

	        
		    // .tickFormat(d3.timeFormat("%H:%M"))		    


		var yAxis = d3.axisLeft(y);
		    // .ticks(10);
	    d3.select("#" + wrapper_id).selectAll("svg").remove();
		var svg = d3.select("#" + wrapper_id).append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", 
		          "translate(" + margin.left + "," + margin.top + ")");

	    var legend_layer = d3.select("#" + wrapper_id + " svg").append('g')
	    					.attr('class', 'legend-layer');

	    var lastTime = _data[_data.length-1][2];

	    var data = [];

	    var lasttime = _data[_data.length-1][2];
	    var reftime = lasttime - filter * 3600 * 1000;

	    // _data = _data.splice(-30);	    
	    console.log('_data', _data);

	    _data = _data.filter(function(d, i) {
	    	return d[2] >= reftime;
	    })

	    var start = _data[0][2];
	    start -= start % 60000;
	    console.log('START', start);

	    var end = _data[_data.length - 1][2];
	    end -= end % 60000;
	    console.log('END', end);

	    var tickCount = 40;
	  	var tickStep = Math.ceil((end-start) / tickCount);  // 30 ticks
	  	tickStep = (tickStep > 60000) ? tickStep : 60000;
	  	tickStep -= tickStep % 60000;

	  	// console.log('tickStep', tickStep);
	  	var data_t = [];
	  	var ticks = 0;		
	  	// for(t=start*1; t < end*1 + tickStep*1 ; t=t*1+tickStep*1) {
  		for(t=end*1; t > start*1 - tickStep*1 ; t=t*1-tickStep*1) {
	  		data_t.push(t);
	  		ticks++;
	  		if(ticks > 50) break;
	  	}
	  	
	  	data_t.reverse();	  
	  	// console.log('DATA_T', data_t);
	    
	    for(var i=0; i<_data.length; i++) {
	    	_data[i][2] -= (_data[i][2] % 60000);
	    }
		_data = _data.filter(function(d, i) {
			var index = data_t.findIndex(function(dd) {
				return dd == d[2];
			});			
			if(index == -1) return false;
			else return true;
		})		
		// console.log('_DATA', _data);	 

		_data = _data.filter(function(d, i) {
			if(i == 0) return true;
			else return d[2] != _data[i-1][2];
		});

		// console.log("_DATA", _data);


		data[0] = _data.filter(function(d, i) {
			if(i == 0) return 1;
			else return !isNaN(d[0]) && Math.abs(d[0] - _data[i-1][0]) >= 50;
			// else return d[0] != _data[i-1][0]
		})	

		console.log('CUSTOM ' + wrapper_id + '-data0', data[0] );	


		data[1] = _data.filter(function(d, i) {
			if(i == 0) return 1;
			else return !isNaN(d[0]) && Math.abs(d[1] - _data[i-1][1]) >= 50;
			// else return d[1] != _data[i-1][1];
		})		    

		console.log('CUSTOM ' + wrapper_id + '-data1', data[1] );





		  x.domain(data_t.map(function(d) { return d; }));
		  // y.domain([0, d3.max(data, function(d) { return d[0]; })]);
		  console.log('X DOMAIN', x.domain());

		  // data[0].forEach(function(d) {
		  // 	console.log('VAL: ' + x(d[2]));
		  // })

		  // data[1].forEach(function(d) {
		  // 	console.log('VAL1: ' + x(d[2]));
		  // })

		  


		  var ymax0 = d3.max(data[0], function(d) { return +d[0]; });
		  var ymax1 = d3.max(data[1], function(d) { return +d[1]; });
		  var ymax = (ymax1 > ymax0) ? ymax1 : ymax0;
		  
		  y.domain([0, ymax]);

		  var x_axis = svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

	      	x_axis.selectAll("line")
		        .filter(function (d, i) {
		        	// d = d - (d % 60000);
		        	if(ticks > 28) {
		          		return (i % 2 == 0);
		          	} else {
		          		return true;
		          	}
		        })
		        .classed("major-tick", true);

		    x_axis.append("text")
		      .style("text-anchor", "middle")
		      .style('fill', 'black')
		      // .attr("dx", "-.8em")
		      .attr("dy", "2.85em")
		      .attr("x", (width/2))
		      .attr("transform", "rotate(0)" )
		      .text("Time Line Axis");

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
    	      .style('fill', 'black')
		      .attr("transform", "rotate(-90)")
		      .attr("y", -40)
		      .attr("dy", ".01em")
		      .attr("x", -height/2)
		      .style("text-anchor", "middle")
		      .text("Money Availability Axis");
		      
	      if(startTime >= x.domain()[0] && startTime <= x.domain()[x.domain().length - 1]) {
	      	console.log('PASS');
      		svg.append("line")          // attach a line
				    .style("stroke", 'red')  // colour the line
				    .attr('x1', x(startTime))
				    .attr('y1', height)
				    .attr('x2', x(startTime))
				    .attr('y2', 0);
		    svg.append("text")
    	      .style('fill', 'red')
		      .style("text-anchor", "middle")
		      .style('font-size', '10px')
		      .attr("y", height + 30)
		      .attr("dy", ".01em")
		      .attr("x", x(startTime))
		      .text("Match");

	      	svg.append("text")
    	      .style('fill', 'red')
    	      .style('font-size', '10px')
		      .style("text-anchor", "middle")
		      .attr("y", height + 40)
		      .attr("dy", ".01em")
		      .attr("x", x(startTime))
		      .text("Start");
				    
	      }

	      var shift_x = [-3, 3];
	      var color = ['#00bcd4', '#ff5722'];
	      var cell = [], bar=[];
	      var legend = [];
	      var legend_txt = ['Back Availability', 'Lay Availability'];
	      var barWidth = 2.5;

	      for(var k=0; k < 2; k++) {
			  cell[k] = svg.selectAll("bar")
			      .data(data[k])
			    .enter().append("g");
			    bar[k] = cell[k].append("rect")
			      .style("fill", color[k])
			      .attr("x", function(d) { return x(d[2]) + shift_x[k]; })
			      .attr("width", barWidth)
			      .attr("y", function(d, i) {

			      	if(i == 0) {
			      		return y(d[k]); 	
			      	} else {
			      		var h0 = height - y(data[k][i-1][k]);
			      		var h1 = height - y(d[k]);
			      		return y(d[k]);
			      	}
			      	
			      })
			      .attr("height", function(d, i) { 
			      	if(i == 0) {
			      		return height - y(d[k]); 
			      	} else {
			      		var h0 = height - y(data[k][i-1][k]);
			      		var h1 = height - y(d[k]);
			      		if(h1 >= h0) {return Math.abs(y(data[k][i-1][k]) - y(d[k]));}
			      		return height - y(d[k]);
			      	}
			      });

			      cell[k].append("line")          // attach a line
				    .style("stroke", color[k])  // colour the line
				    .style("stroke-dasharray", ("3, 3"))
				    .attr("x1", function(d, i) {
				    	if(i == 0) {
				    		return 0;
				    	} else {
				    		console.log('X1', x(data[k][i-1][2]) + shift_x[k]);
				    		return x(data[k][i-1][2]) + shift_x[k];
				    	}
				    })  
				    .attr("y1", function(d, i) {
				    	if(i == 0) {
				    		return 0;
				    	} else {
				    		return y(data[k][i-1][k]);
				    	}
				    }) 
				    .attr("x2", function(d, i) {
				    	if(i == 0) {
				    		return 0;
				    	} else {
				    		var h0 = height - y(data[k][i-1][k]);
			      			var h1 = height - y(d[k]);
			      			if(h1 >= h0) {
			      				console.log('X2', x(d[2]) + shift_x[k]);
			      				return x(d[2]) + shift_x[k];	

			      			} else {
			      				console.log('X2', x(data[k][i-1][2]) + shift_x[k]);
			      				return x(data[k][i-1][2]) + shift_x[k]; // set x2 same as x1 when value goes down
			      			}
				    		
				    	}
				    })
				    .attr("y2", function(d, i) {
				    	if(i == 0) {
				    		return 0;
				    	} else {
				    		return y(data[k][i-1][k]);
				    	}
				    });

			    legend[k] = legend_layer.append('g')
			    			.attr("transform", 
		          				"translate(" + (margin.left + k * width/2 + 20) + "," + 30 + ")");
    			legend[k].append('rect')
    					.style("fill", color[k])
    					.attr('x', 0)
    					.attr('y', 6)
    					.attr('width', 10)
    					.attr('height', 10);

				legend[k].append('text')
						.attr('x', 20)
    					.attr('y', 16)
						.text(legend_txt[k]);

			}

			var title_legend = legend_layer.append('g')
			    			.attr("transform", 
		          				"translate(" + (margin.left + 500) + "," + 5 + ")");

	    			title_legend.append('text')
						.attr('x', 0)
    					.attr('y', 10)
    					.attr('text-anchor', 'middle')
    					.attr('font-weight', 'bold')
						.text(match_name);

					title_legend.append('text')
						.attr('x', 0)
    					.attr('y', 26)
    					.attr('text-anchor', 'middle')
    					.attr('font-weight', 'bold')
						.text(title);


	}


	// $(window).unload(function(){
	//   localStorage.removeItem('credential');
	//   localStorage.removeItem('availability');
	//   localStorage.removeItem('data');
	// });

} // End code for dataviz.betfair.it

function checkAuth() {
	var credential = jQuery.parseJSON(localStorage.getItem('credential'));
	if(credential == undefined || credential.xAuthentication == undefined || credential.xApplication == undefined || credential.xAuthentication == "" || credential.xApplication == "") {
		$('.led-button').removeClass('led-red').removeClass('led-green').addClass('led-red');
		$('.led-button').text('No Auth');
		showStatus('Please login betfair.');
	} else {
		$('.led-button').removeClass('led-red').removeClass('led-green').addClass('led-green');
		$('.led-button').text('Auth');
	}
	
}



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

function getRomeTime() {
    // create Date object for current location
    var d = new Date();

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var offset = "+1";
    // return time as a string
    return utc + (3600000*offset);
}

function convertTime(timeStamp, offset) {    
    return timeStamp + (3600000*offset);
}


function showStatus(msg) {
	$('.status-bar').text(msg);
}