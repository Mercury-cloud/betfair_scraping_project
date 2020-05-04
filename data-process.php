<?php
	$data = json_decode(($_POST['data']), true);
	// var_dump($data['marketNodes']);
	$tables = makeCombineTable($data);
	$tables .= makeAvalibilityTable($data);
	$tables .= makeMinMaxTable($data);
	$tables .= makeQuoteTable($data);

	$charttables = makeChartTable(0, $data);
	$charttables .= makeChartTable(2, $data);
	$charttables .= makeChartTable(1, $data);

	echo json_encode(['tables' => $tables, 'charttables' => $charttables]);

	function makeChartTable($selectionId, $data) {
		$records = [];
		if(isset($data['marketNodes'][0]['runners'])) {
			$runners = $data['marketNodes'][0]['runners'];	
		}		

		if(isset($runners[$selectionId]['exchange'])) {			
			$exchange = $runners[$selectionId]['exchange'];
			$keys = ['availableToBack', 'availableToLay', 'traded'];
			foreach ($keys as $key) {
				if(isset($exchange[$key])) {
					
					foreach ($exchange[$key] as $list) {						
						$matched_index = null;
						foreach ($records as $i => $record) {
							if($record['price'] == $list['price']) {
								$matched_index = $i;
								break;								
							}
						}
						if(isset($matched_index)) {
							$records[$matched_index][$key] = $list['size'];
						} else {
							$records[] = ['price' => $list['price'], $key => $list['size']];	
						}						
					}
				}
			}
			foreach ($records as $i => $record) {
				if(isset($record['availableToBack']) && !isset($record['availableToLay']) && $record['price'] != 1) $records[$i]['counterValue'] = $record['availableToBack']/($record['price']/($record['price']-1)-1);
				elseif(!isset($record['availableToBack']) && isset($record['availableToLay'])) $records[$i]['counterValue'] = $record['availableToLay'];
			}
			usort($records, "cmp");					


		}


		$recHtml = '<div style="float: left; width: 390px; margin-right: 15px;"><div class="match-name"></div><div id="chart_tbl' . $selectionId . '" class="chart-title"></div><div style="overflow: auto; height: 600px;">';			
			$recHtml .= '<table class="table table-resonsive table-bordered table-striped table-hover" id="chart-table" style="">';
				$recHtml .= '<thead>';
					$recHtml .= '<tr class="table-header1 top-border" style="line-height: 2px;">';
						$recHtml .= '<th>Punta</th>';
						$recHtml .= '<th>Quote</th>';
						$recHtml .= '<th>Banca</th>';
						$recHtml .= '<th>Scambiate</th>';
						$recHtml .= '<th>Controvalori</th>';
					$recHtml .= '</tr>';		

				foreach ($records as $key => $record) {									

					$recHtml .= '<tr class="table-header3">';						
					if(isset($record['availableToBack'])) {
						$recHtml .= '<td class="back">' . format_currency1($record, 'availableToBack') . '</td>';
						$recHtml .= '<td>' . format_value1($record, 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($record, 'availableToLay') . '</td>';						
					} elseif(isset($record['availableToLay'])) {
						$recHtml .= '<td>' . format_currency1($record, 'availableToBack') . '</td>';
						$recHtml .= '<td>' . format_value1($record, 'price') . '</td>';
						$recHtml .= '<td class="lay">' . format_currency1($record, 'availableToLay') . '</td>';						
					} else {
						$recHtml .= '<td>' . format_currency1($record, 'availableToBack') . '</td>';
						$recHtml .= '<td>' . format_value1($record, 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($record, 'availableToLay') . '</td>';						
					}
						$recHtml .= '<td>' . format_currency1($record, 'traded') . '</td>';
						$recHtml .= '<td>' . format_value1($record, 'counterValue') . '</td>';

					$recHtml .= '</tr>';
				}
					
				$recHtml .= '</thead>';
			$recHtml .= '</table>';
		$recHtml .= '</div></div>';
		return $recHtml;



			
	}

	function cmp($a, $b)
	{
	    if ($a['price'] == $b['price']) {
	        return 0;
	    }
	    return ($a['price'] < $b['price']) ? -1 : 1;
	}

	

	$matched = ['', '', '']; $total='';
	function makeCombineTable($data) {
		global $matched, $total;		
		if(isset($data['marketNodes'][0]['runners'])) {
			$runners = $data['marketNodes'][0]['runners'];	
		}	
		
		if(isset($runners)) {
			if(isset($runners[0]['state']['totalMatched'])) $matched[0] = $runners[0]['state']['totalMatched'];
			if(isset($runners[2]['state']['totalMatched'])) $matched[2] = $runners[2]['state']['totalMatched'];
			if(isset($runners[1]['state']['totalMatched'])) $matched[1] = $runners[1]['state']['totalMatched'];
			$total = $matched[0] * 1 + $matched[1] * 1 + $matched[2] * 1;
		}

		$recHtml = '';			
			$recHtml .= '<table class="table table-resonsive table-bordered table-striped table-hover" id="combine-table" style="width: 800px">';
				$recHtml .= '<thead>';
					$recHtml .= '<tr class="table-header1 top-border" style="line-height: 2px;">';
						$recHtml .= '<td width="10%" colspan="1" rowspan="2">Abbinate</td>';
						$recHtml .= '<td width="20%" colspan="1">Totali</td>';
						$recHtml .= '<td width="20%" colspan="1">1</td>';
						$recHtml .= '<td width="20%" colspan="1">X</td>';
						$recHtml .= '<td width="20%" colspan="1">2</td>';
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header2">';
						$recHtml .= '<td>' . format_currency($total)  . '</td>';
						$recHtml .= '<td>' . format_currency($matched[0])  . '</td>';
						$recHtml .= '<td>' . format_currency($matched[2])  . '</td>';	
						$recHtml .= '<td>' . format_currency($matched[1])  . '</td>';						
					$recHtml .= '</tr>';
					
				$recHtml .= '</thead>';
			$recHtml .= '</table>';
			return $recHtml;
	}

	$subtotal=['', '', '']; $_total='';
	function makeAvalibilityTable($data) {		
		if(isset($data['marketNodes'][0]['runners'])) {
			$runners = $data['marketNodes'][0]['runners'];	
		}
		$back=['', '', '']; $lay=['', '', ''];//row 1
		global $subtotal; // row 2
		global $_total; // row 3		
		$risk_back=['', '', '']; $risk_lay=['', '', ''];//row 4		
		if(isset($runners)) {
			$_total = 0;
			for($i=0; $i<3; $i++) {
				if(isset($runners[$i]['exchange']['availableToBack'])) $back_values[$i] = $runners[$i]['exchange']['availableToBack'];
				if(isset($runners[$i]['exchange']['availableToLay'])) $lay_values[$i] = $runners[$i]['exchange']['availableToLay'];					
				if(isset($back_values[$i])) {
					$back[$i] = 0;
					$risk_back[$i] = 0;	
					foreach ($back_values[$i] as $value) {
						if(isset($value['size']) && is_numeric($value['size'])) $back[$i] += $value['size'];
						if(isset($value['price']) && is_numeric($value['price'])) $risk_back[$i] += $value['size'] / ($value['price'] / ($value['price'] - 1) - 1);							
					}
				}
				if(isset($lay_values[$i])) {
					$lay[$i] = 0;
					foreach ($lay_values[$i] as $value) {
						if(isset($value['size']) && is_numeric($value['size'])) $lay[$i] += $value['size'];						
					}	
				}				
				if(is_numeric($back[$i]) || is_numeric($lay[$i])) {
					$subtotal[$i] = 0;
					if(is_numeric($back[$i])) $subtotal[$i] += $back[$i];
					if(is_numeric($lay[$i])) $subtotal[$i] += $lay[$i];
				}
				
				if(is_numeric($subtotal[$i])) $_total += $subtotal[$i];

				$risk_lay[$i] = $lay[$i];

			}
		}
		$recHtml = '';			
			$recHtml .= '<table class="table table-resonsive table-bordered table-striped table-hover" id="availiability-table" style="width: 800px">';
				$recHtml .= '<thead>';
					$recHtml .= '<tr class="table-header1 top-border" style="line-height: 2px;">';
						$recHtml .= '<td width="31%" colspan="1" rowspan="2">Disponibilità</td>';
						$recHtml .= '<td width="23%" colspan="2">1</td>';
						$recHtml .= '<td width="23%" colspan="2">X</td>';
						$recHtml .= '<td width="23%" colspan="2">2</td>';
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header2">';
						$recHtml .= '<td class="back">Punta</td>';
						$recHtml .= '<td class="lay">Banca</td>';
						$recHtml .= '<td class="back">Punta</td>';
						$recHtml .= '<td class="lay">Banca</td>';
						$recHtml .= '<td class="back">Punta</td>';
						$recHtml .= '<td class="lay">Banca</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Disponibilità Punta/Banca per Segno</td>';
						$recHtml .= '<td>' . format_currency($back[0]) . '</td>';
						$recHtml .= '<td>' . format_currency($lay[0]) . '</td>';
						$recHtml .= '<td>' . format_currency($back[2]) . '</td>';						
						$recHtml .= '<td>' . format_currency($lay[2]) . '</td>';
						$recHtml .= '<td>' . format_currency($back[1]) . '</td>';
						$recHtml .= '<td>' . format_currency($lay[1]) . '</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Disponibilità Totale per segno</td>';
						$recHtml .= '<td colspan="2">' . format_currency($subtotal[0]) . '</td>';
						$recHtml .= '<td colspan="2">' . format_currency($subtotal[2]) . '</td>';
						$recHtml .= '<td colspan="2">' . format_currency($subtotal[1]) . '</td>';										
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Disponibilità Totale 1X2</td>';
						$recHtml .= '<td colspan="6">' . format_currency($_total) . '</td>';	
					$recHtml .= '</tr>';					
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Rischio Valori</td>';
						$recHtml .= '<td>' . format_currency($risk_back[0]) . '</td>';
						$recHtml .= '<td>' . format_currency($risk_lay[0]) . '</td>';
						$recHtml .= '<td>' . format_currency($risk_back[2]) . '</td>';						
						$recHtml .= '<td>' . format_currency($risk_lay[2]) . '</td>';
						$recHtml .= '<td>' . format_currency($risk_back[1]) . '</td>';
						$recHtml .= '<td>' . format_currency($risk_lay[1]) . '</td>';								
					$recHtml .= '</tr>';
					
				$recHtml .= '</thead>';
			$recHtml .= '</table>';
		return $recHtml;
	}

	function makeMinMaxTable($data) {
		if(isset($data['marketNodes'][0]['runners'])) {
			$runners = $data['marketNodes'][0]['runners'];	
		}
		$low_odds=['', '', ''];	// 1st row
		$high_odds=['', '', ''];	// 2nd row
		$high_back=['', '', ''];	// 3rd row
		$high_lay=['', '', ''];	// 4th row
		$high_traded=['', '', ''];	// 5th row
		// var_dump($runners);
		// die;
		if(isset($runners)) {
			for($i=0; $i<3; $i++) {
				if(isset($runners[$i]['exchange']['traded'])) $traded_arr = $runners[$i]['exchange']['traded'];
				if(isset($traded_arr) && is_array($traded_arr) && count($traded_arr) > 0) {
					
					$high_odds[$i] = end($traded_arr);
					$low_odds[$i] = $traded_arr[0];	

					$high_traded[$i] = array_reduce($traded_arr, function($a, $b){
					  return $a ? ($a['size'] > $b['size'] ? $a : $b) : $b;
					});	

				}

				if(isset($runners[$i]['exchange']['availableToBack'])) $back_arr = $runners[$i]['exchange']['availableToBack'];
				if(isset($back_arr) && is_array($back_arr) && count($back_arr) > 0) {
					
					$high_back[$i] = array_reduce($back_arr, function($a, $b){
					  return $a ? ($a['size'] > $b['size'] ? $a : $b) : $b;
					});															
				}

				if(isset($runners[$i]['exchange']['availableToLay'])) $lay_arr = $runners[$i]['exchange']['availableToLay'];
				if(isset($lay_arr) && is_array($lay_arr) && count($lay_arr) > 0) {					
					$high_lay[$i] = array_reduce($lay_arr, function($a, $b){
					  return $a ? ($a['size'] > $b['size'] ? $a : $b) : $b;
					});
					// echo "TEST $i <br>";
					// var_dump($lay_back);
					// echo "<br>";										
				}
			}
		}


		$recHtml = '';			
			$recHtml .= '<table class="table table-resonsive table-bordered table-striped table-hover" id="minmax-table" style="width: 800px">';
				$recHtml .= '<thead>';
					$recHtml .= '<tr class="table-header1 top-border" style="line-height: 2px;">';
						$recHtml .= '<td width="31%" colspan="1" rowspan="2">Minimi/Massimi</td>';
						$recHtml .= '<td width="23%" colspan="2">1</td>';
						$recHtml .= '<td width="23%" colspan="2">X</td>';
						$recHtml .= '<td width="23%" colspan="2">2</td>';
					$recHtml .= '</tr>';					
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Q.te</td>';
						$recHtml .= '<td>Valori</td>';
						$recHtml .= '<td>Q.te</td>';						
						$recHtml .= '<td>Valori</td>';
						$recHtml .= '<td>Q.te</td>';
						$recHtml .= '<td>Valori</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quota più bassa abbinata</td>';
						$recHtml .= '<td>' . format_value1($low_odds[0],'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($low_odds[0], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($low_odds[2],'price') . '</td>';						
						$recHtml .= '<td>' . format_currency1($low_odds[2],'size') . '</td>';
						$recHtml .= '<td>' . format_value1($low_odds[1],'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($low_odds[1],'size') . '</td>';						
					$recHtml .= '</tr>';									
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quota più alta abbinata</td>';
						$recHtml .= '<td>' . format_value1($high_odds[0], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_odds[0], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_odds[2], 'price') . '</td>';						
						$recHtml .= '<td>' . format_currency1($high_odds[2], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_odds[1], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_odds[1], 'size') . '</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quota più scambiata</td>';
						$recHtml .= '<td>' . format_value1($high_back[0], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_back[0], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_back[2], 'price') . '</td>';						
						$recHtml .= '<td>' . format_currency1($high_back[2], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_back[1], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_back[1], 'size') . '</td>';						
					$recHtml .= '</tr>';									
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quota Punta più richiesta</td>';
						$recHtml .= '<td>' . format_value1($high_lay[0], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_lay[0], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_lay[2], 'price') . '</td>';						
						$recHtml .= '<td>' . format_currency1($high_lay[2], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_lay[1], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_lay[1], 'size') . '</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quota Banca più richiesta</td>';
						$recHtml .= '<td>' . format_value1($high_traded[0], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_traded[0], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_traded[2], 'price') . '</td>';						
						$recHtml .= '<td>' . format_currency1($high_traded[2], 'size') . '</td>';
						$recHtml .= '<td>' . format_value1($high_traded[1], 'price') . '</td>';
						$recHtml .= '<td>' . format_currency1($high_traded[1], 'size') . '</td>';						
					$recHtml .= '</tr>';
					
				$recHtml .= '</thead>';
			$recHtml .= '</table>';
		return $recHtml;
		
	}

	function makeQuoteTable($data) {
		global $total, $matched, $_total, $subtotal;
		$quote_back = ['', '', '']; $quote_lay = ['', '', ''];	// row 1
		$quote_combine = ['', '', ''];	// row 2
		$quote_availibility = ['', '', ''];	// row 3
		if(isset($data['marketNodes'][0]['runners'])) {
			$runners = $data['marketNodes'][0]['runners'];	
		}
		if(isset($runners)) {
			for($i=0; $i<3; $i++) {					
				if(isset($runners[$i]['exchange']['availableToBack'][0]['price'])) $quote_back[$i] = $runners[$i]['exchange']['availableToBack'][0]['price'];
				if(isset($runners[$i]['exchange']['availableToLay'][0]['price'])) $quote_lay[$i] = $runners[$i]['exchange']['availableToLay'][0]['price'];
				if(isset($total) && isset($matched[$i]) && $matched[$i] != 0) {
					$quote_combine[$i] = $total / $matched[$i];					
				}
				if(isset($_total) && isset($subtotal[$i]) && $subtotal[$i] != 0) {
					$quote_availibility[$i] = $_total / $subtotal[$i];
				}
			}
		}
		
		$recHtml = '';			
			$recHtml .= '<table class="table table-resonsive table-bordered table-striped table-hover" id="quote-table" style="width: 800px">';
				$recHtml .= '<thead>';
					$recHtml .= '<tr class="table-header1 top-border" style="line-height: 2px;">';
						$recHtml .= '<td width="31%" colspan="1" rowspan="2">Quote</td>';
						$recHtml .= '<td width="23%" colspan="2">1</td>';
						$recHtml .= '<td width="23%" colspan="2">X</td>';
						$recHtml .= '<td width="23%" colspan="2">2</td>';
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header2">';
						$recHtml .= '<td class="back">Punta</td>';
						$recHtml .= '<td class="lay">Banca</td>';
						$recHtml .= '<td class="back">Punta</td>';
						$recHtml .= '<td class="lay">Banca</td>';
						$recHtml .= '<td class="back">Punta</td>';
						$recHtml .= '<td class="lay">Banca</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quote attuali</td>';
						$recHtml .= '<td class="back">' . format_value($quote_back[0]) . '</td>';
						$recHtml .= '<td class="lay">' . format_value($quote_lay[0]) . '</td>';
						$recHtml .= '<td class="back">' . format_value($quote_back[2]) . '</td>';						
						$recHtml .= '<td class="lay">' . format_value($quote_lay[2]) . '</td>';
						$recHtml .= '<td class="back">' . format_value($quote_back[1]) . '</td>';
						$recHtml .= '<td class="lay">' . format_value($quote_lay[1]) . '</td>';						
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quote in base a  Volume abbinato</td>';
						$recHtml .= '<td colspan="2">' . format_value($quote_combine[0]) . '</td>';
						$recHtml .= '<td colspan="2">' . format_value($quote_combine[2]) . '</td>';						
						$recHtml .= '<td colspan="2">' . format_value($quote_combine[1]) . '</td>';
					$recHtml .= '</tr>';
					$recHtml .= '<tr class="table-header3">';						
						$recHtml .= '<td>Quota in base a disponibilità momentanea</td>';
						$recHtml .= '<td colspan="2">' . format_value($quote_availibility[0]) . '</td>';
						$recHtml .= '<td colspan="2">' . format_value($quote_availibility[2]) . '</td>';						
						$recHtml .= '<td colspan="2">' . format_value($quote_availibility[1]) . '</td>';																	
					$recHtml .= '</tr>';
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

	function format_value1($obj, $key) {
		if(isset($obj[$key])) {
			return number_format($obj[$key], 2);
		} else {
			return '';
		}
	}

	function format_currency1($obj, $key) {
		if(isset($obj[$key])) {
			return "&euro;" . number_format($obj[$key], 2);
		} else {
			return '';
		}
	}

	// function checkKeyInArray($arr, $keys) {
	// 	foreach ($keys as $key) {
	// 		if(isset($arr[$key]) != true) {
	// 			return false;
	// 		}
	// 		$arr = $arr[$key];
	// 	}
	// 	return true;		
	// }
?>
