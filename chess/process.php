<?php
error_reporting(0);
date_default_timezone_set('Asia/Kolkata');

if(empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest'){
    echo '<div style="font-size:21px; margin-top:100px; text-align:center;">';
    echo '<p style="font-size:26px;">Unauthorised Access</p>';
    echo '<p>Restrcited Area</p>';
    echo '</div>';
    exit();
}
if( empty($_GET['act']) ) {
    exit();
}
$act = $_GET['act'];
$config = [
    'file_top_ten' => 'bs_top_ten.txt',
    'file_tr_data' => 'bs_tr_data.txt',
    'file_user_data' => 'bs_user_data.txt',
];


if( $act == 'init' ) {
    if( $_SERVER['REMOTE_ADDR'] == '::1' ) {
        show_data();
    }
    $user_info = json_decode(file_get_contents($config['file_tr_data']), true);
    $user_info[] = array(
        'user' => $_POST['username'] ? $_POST['username'] : 'unregistered',
        'time' => date('Y-m-d h:i:s A'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'data' => $_SERVER['HTTP_USER_AGENT'],
    );
    file_put_contents($config['file_tr_data'], json_encode($user_info));
}

function show_data( $data = '', $status = 0 ){
    $send_data = [
        'status' => $status ? 200 : 400,
        'response' => $data
    ];
    header('content-type:application/json');
    echo json_encode($send_data);
    exit();
}

?>