<?php
	
	$curl = curl_init();

	// $jsonRequestBody = ['filter' => ['marketBettingTypes' => ['ASIAN_HANDICAP_SINGLE_LINE', 'ASIAN_HANDICAP_DOUBLE_LINE', 'ODDS'],'productTypes' => ['EXCHANGE'],'marketTypeCodes' => [],'selectBy' =>'FIRST_TO_START_AZ','contentGroup' => ['language' => 'en','regionCode' => 'UK'],'eventIds' => [29082254,29082245,29082240,29076518,],'maxResults' => 1000,'eventTypeIds' => [1]],'currencyCode' => 'EUR','locale' => 'it',
	// 			'facets' => [['type' => 'EVENT_TYPE', 'maxValues' => 0, 'skipValues' => 0, 'applyNextTo' => 0, 
	// 			'next' => ['type' => 'COMPETITION_REGION', 'maxValues' => 0, 'skipValues' => 0, 'applyNextTo' => 0, 'next' => ['type' => 'COMPETITION', 'maxValues' => 0, 'skipValues' => 0, 'applyNextTo' => 0]]
	// 			], ['type' => 'EVENT', 'maxValues' => 0, 'skipValues' => 0, 'applyNextTo' => 0]]
	// 		];

	// $jsonRequestBody = ['filter' => ['marketBettingTypes' => ['ODDS'],'productTypes' => ['EXCHANGE'],'marketTypeCodes' => [],'selectBy' =>'FIRST_TO_START_AZ','contentGroup' => ['language' => 'en','regionCode' => 'UK'],'eventIds' => [29082254,29082245,29082240,29076518,],'maxResults' => 0,'eventTypeIds' => [1]],'currencyCode' => 'EUR','locale' => 'it',
	// 	'facets' => [['type' => 'EVENT_TYPE', 
	// 	'next' => ['type' => 'COMPETITION_REGION', 'next' => ['type' => 'COMPETITION']]
	// 	]]
	// ];

	// $jsonRequestBody = ['filter' => ['marketBettingTypes' => ['ODDS'],'productTypes' => ['EXCHANGE'],'marketTypeCodes' => [],'selectBy' =>'FIRST_TO_START_AZ','contentGroup' => ['language' => 'en','regionCode' => 'UK'],'eventIds' => [29062799,29082283,29082125,29066493,29066492,29066490,29082121,29066491,29077867,29075019,29082151,29075021,29075033,29066494,29075020,29075035,29082719,29082113,29082716,29083986,29083988,29084009,29084013,29084015,29075064,29075066,29083969,29083980,29081798,29075065,29063702,29083495,29083451,29080903,29083505,29083452,29075046,29075047,29083456,29083455],'maxResults' => 1000,'eventTypeIds' => [1]],'currencyCode' => 'EUR','locale' => 'it',
	// 			'facets' => [['type' => 'EVENT_TYPE', 'maxValues' => 0, 'skipValues' => 0, 'applyNextTo' => 0, 
	// 			'next' => ['type' => 'COMPETITION_REGION','next' => ['type' => 'COMPETITION']]
	// 			]]
	// 		];

	$url = "https://www.betfair.it/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=EUR&locale=it&marketIds=1.155402387&rollupLimit=10&rollupModel=STAKE&types=MARKET_STATE,EVENT,RUNNER_EXCHANGE_PRICES_BEST";
	var_dump($url);

	curl_setopt_array($curl, array(
	  CURLOPT_URL => "https://www.betfair.it/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=EUR&locale=it&marketIds=1.155402387&rollupLimit=10&rollupModel=STAKE&types=MARKET_STATE,EVENT,RUNNER_EXCHANGE_PRICES_BEST",
	  CURLOPT_RETURNTRANSFER => true,
	  // CURLOPT_POSTFIELDS => json_encode($jsonRequestBody),
	  // CURLOPT_USERAGENT => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_CUSTOMREQUEST => "GET",
	  CURLOPT_HTTPHEADER => array(
	  	"origin: https://www.betfair.it",
	  	// "accept-encoding: gzip, deflate, br",
	  	// "accept-language: en-GB,en-US;q=0.9,en;q=0.8",    
		// "user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36",
		"content-type: application/json",
		// "accept: application/json",
		"referer: https://www.betfair.it/exchange/plus/football",
		// "connection", "keep-alive",
		// "cache-control", "no-cache"    
	  ),
	));

	$response = curl_exec($curl);
	$err = curl_error($curl);
	
	curl_close($curl);

	$map = array();

	if ($err) {

	  echo "cURL Error #:" . $err;

	} else {
	  // echo $response;
		echo $response;
		// foreach (json_decode($response)->results as $key => $val) {
		// }
	}
	