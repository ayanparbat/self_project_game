<?php
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//  Title       : API for Multi player Fish card game
//  Author      : Ayan Parbat
//  Date        : 19/12/2021
//  Desclaimer  : DONT use it for gambling purpose,
//                DONT USE IT IF YOU ARE NOT 18+ YEARS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

require_once('function.php');

if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    if (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
        show_restrict_msg();
    }
} else {
    show_restrict_msg();
}

$data = array('status' => 300, 'error' => '');

if(empty($_GET['a'])){
	$data['error'] = 'Action missing';
    show_data();
}
$a = $_GET['a'];

if($action == 'login'){

	echo json_encode($data);
	exit();
}



function show_data($status = false){
	$data['status'] = ($status) ? 200 : 300;
	header('Content-type: application/json');
	echo json_encode($data);
    exit();
}
function show_restrict_msg(){
	echo '<div style="font-size:21px; margin-top:100px; text-align:center;">';
	echo '<p style="font-size:26px;">Unauthorised Access</p>';
	echo '<p>Restrcited Area</p>';
	echo '</div>';
    exit();
}

?>