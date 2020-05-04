<?php
error_reporting(E_ERROR | E_PARSE);
$start_time = time();

$marketTypeArray = ["MATCH_ODDS", "OVER_UNDER_15", "OVER_UNDER_25", "OVER_UNDER_35", "OVER_UNDER_45"];

$data = @file_get_contents('betfair-data.json');
// echo "betfair-data--->".$data;
$data = json_decode($data);

$scoreData = $data->score;
$marketData = $data->market;
$leagueData = $data->league;
$marketIdsAndEventIDMapByType = $data->marketIdsAndEventIDMapByType;

$eventIdList = [];
foreach ($scoreData as $key => $value) {
	$eventIds = explode(',', $value->eventIds);
	$eventIdList = array_merge($eventIdList, explode(',', $value->eventIds));
}
$map_list = [];

$pre_data = @file_get_contents('pre-data.json');
$pre_map_list = json_decode($pre_data);	
if($pre_map_list == null) {
	$pre_map_list = (object) array();
} else {
}

$deadDate = date("Y-m-d", strtotime('-2 days'));
foreach ($pre_map_list as $key => $value) {
	if($value->timestamp <= $deadDate) {
		unset($pre_map_list->{$key});
	}
}

// 
$eventAndLeagueMap = [];
processLeagueData();
function processLeagueData() {
	global $leagueData, $eventAndLeagueMap;
	foreach ($leagueData as $key => $obj) {
		$results = $obj->data->results;		
		$subMap = [];
		for ($i=0; $i < count($results); $i = $i+5) {			
			$subMap[$results[$i]->eventId] = $results[$i]->competitionId;			
		}			
		foreach ($subMap as $eventId => $competitionId) {						
			if(isset($competitionId) == true)
			$eventAndLeagueMap[$eventId] = $obj->data->attachments->competitions->{$competitionId}->name;			
		}
	}	
}
// 

$defaultTimeZone = new DateTimeZone('Europe/London');
$localTimeZone = new DateTimeZone('Europe/Rome');
foreach ($eventIdList as $i => $eventId) {
	$map = [];
	foreach ($scoreData as $key => $obj) {
		if(strpos($obj->eventIds, $eventId) !== false) {					
			foreach ($obj->data as $key1 => $val) {
				if($val->eventId == $eventId) {
					$score = $val;		
				}
			}
			
		}
	}

	foreach ($marketTypeArray as $j => $marketType) {			

		$marketIdsAndEventIDMap = $marketIdsAndEventIDMapByType->$marketType;
		if(isset($marketIdsAndEventIDMap->$eventId)) {

			// echo $eventId . ' -- ' . $marketIdsAndEventIDMap->$eventId . ' (' . $marketType . ')' . "<br>";
			$marketId = $marketIdsAndEventIDMap->$eventId;
			foreach ($marketData->$marketType as $k => $marktetGrp) {				

				if(strpos($marktetGrp->marketIds, $marketId) !== false) {					
					foreach ($marktetGrp->data->eventTypes[0]->eventNodes as $key => $eventNode) {
						
						if($eventNode->eventId == $eventId) {		
							$map['eventId'] = $eventId;
							$map['marketId'] = $marketId;
							$map['league'] = $eventAndLeagueMap[$eventId];					

							if(isset($score->state) && isset($score->state->score)) {
								$scoreValue = $score->state->score->home->score . '-' . $score->state->score->away->score;												
								$map['score'] = $scoreValue;
							} else {
								$map['score'] = '0-0';
							}

							if(isset($score->state) && isset($score->state->timeElapsed)) {
								$map["timeElapsed"] = $score->state->timeElapsed;
								if($score->state->status == 'FirstHalfEnd') {
									$map["timeElapsed"] = 'HT';
								}
							} else {
								$map["timeElapsed"] = '0';
							}


							// $startDate = date('Y-m-d H:i', strtotime($eventNode->event->openDate));
							$startDate = new DateTime($eventNode->event->openDate, $defaultTimeZone);
							$startDate->setTimezone($localTimeZone);
							$map['startTime'] = $startDate->format('Y-m-d H:i');

							date_default_timezone_set('Europe/Rome');
							$currentTime = time();
							$fromTime =  mktime(4, 0, 0, date("m"), date("d"), date("y"));
							if($currentTime <= $fromTime) {
								$toTime = $fromTime;
								$fromTime = strtotime("-1 day", $toTime);
							} else {
								$toTime = strtotime("+1 day", $fromTime);	
							}
							
							$actualTime = strtotime($map['startTime']);
							if($actualTime < $fromTime || $actualTime > $toTime) {
								continue 4;
							}

							$map['startTime'] = $startDate->format('d/m/Y H:i');							
							$marketNode = $eventNode->marketNodes[0];
							$map['matchName'] = str_replace(' - ', ' v ', $eventNode->event->eventName);

							$map['status'] = $marketNode->state->inplay;
							$map['matchstatus'] = $marketNode->state->status;



							$map_list[] = $map;
							continue 4;							
						}
					}
				}

			}
		} else {
		}

	}
	

}


// print "<br><br><br><br><br>";
// var_dump($map_list);
// var_dump($pre_map_list);

echo json_encode(['data' => $map_list]);

// echo "Execution Time: ".(time() - $start_time)."S";