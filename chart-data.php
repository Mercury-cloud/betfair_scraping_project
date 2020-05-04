<?php
	$data = json_decode(($_POST['data']), true);
	$chartData = json_decode($_POST['chartData'], true);
	// var_dump($data['marketNodes']);
	$tables = makeDroppingOddsTable($data, $chartData);
	

	echo json_encode(['tables' => $tables]);
	
	function makeDroppingOddsTable($data, $chartData) {
		$main_change = ['', '', '']; $main_quote = ['', '', ''];	// row 1
		$open_change = ['', '', '']; $open_quote = ['', '', ''];	// row 2
		
		if(isset($data['marketNodes'][0]['runners'])) {
			$runners = $data['marketNodes'][0]['runners'];	
		}
		if(isset($runners)) {
			for($i=0; $i<3; $i++) {					
				if(isset($runners[$i]['exchange']['traded'])) $traded_arr = $runners[$i]['exchange']['traded'];
				if(isset($traded_arr)) {
					$main_odds = array_reduce($traded_arr, function($a, $b){
					  return $a ? ($a['size'] > $b['size'] ? $a : $b) : $b;
					});
					if(isset($main_odds['price'])) {
						$main_change[$i] = $main_odds['price'];		
					}					
				}
				

				if(isset($chartData[$i]['series'][0])) {					
					$open_change[$i] = $chartData[$i]['series'][0][0];	//opening odds
					$main_quote[$i] = $open_quote[$i] = end($chartData[$i]['series'])[0];	// last odds
				}		
			}
		}
		
		$recHtml = '';			
			$recHtml .= '<table class="table table-resonsive table-bordered table-striped table-hover" id="combine-table" style="width: 800px">';
				$recHtml .= '<thead>';
					$recHtml .= '<tr class="table-header1 top-border" style="line-height: 2px;">';
						$recHtml .= '<td width="31%" colspan="1" rowspan="2">Dropping Odds</td>';
						$recHtml .= '<td width="23%" colspan="2">1</td>';
						$recHtml .= '<td width="23%" colspan="2">X</td>';
						$recHtml .= '<td width="23%" colspan="2">2</td>';
					$recHtml .= '</tr>';					
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Variazione</td>';
						$recHtml .= '<td>Q.ta Attuale</td>';
						$recHtml .= '<td>Variazione</td>';						
						$recHtml .= '<td>Q.ta Attuale</td>';
						$recHtml .= '<td>Variazione</td>';
						$recHtml .= '<td>Q.ta Attuale</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Drop tra la quota con più Abbinate e quella attuale</td>';
						$recHtml .= '<td>' . format_value($open_change[0]) . '</td>';
						$recHtml .= '<td>' . format_value($open_quote[0]) . '</td>';
						$recHtml .= '<td>' . format_value($open_change[2]) . '</td>';						
						$recHtml .= '<td>' . format_value($open_quote[2]) . '</td>';
						$recHtml .= '<td>' . format_value($open_change[1]) . '</td>';
						$recHtml .= '<td>' . format_value($open_quote[1]) . '</td>';						
					$recHtml .= '</tr>';									
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Drop tra quota di apertiura e quota attuale</td>';
						$recHtml .= '<td>' . format_value($main_change[0]) . '</td>';
						$recHtml .= '<td>' . format_value($main_quote[0]) . '</td>';
						$recHtml .= '<td>' . format_value($main_change[2]) . '</td>';						
						$recHtml .= '<td>' . format_value($main_quote[2]) . '</td>';
						$recHtml .= '<td>' . format_value($main_change[1]) . '</td>';
						$recHtml .= '<td>' . format_value($main_quote[1]) . '</td>';
				$recHtml .= '</thead>';
			$recHtml .= '</table>';
		return $recHtml;
	}

	function format_currency($value) {
		if(is_numeric($value)) {
			return '&euro;' . number_format($value, 2);
		} else {
			return '';
		}
	}

	function format_value($value) {
		if(is_numeric($value)) {
			return number_format($value, 2);
		} else {
			return '';
		}
	}
	
?>
