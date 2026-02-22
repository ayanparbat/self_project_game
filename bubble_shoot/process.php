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
else if( $act == 'get_top_ten' ) {
    show_data(json_decode(file_get_contents($config['file_top_ten']), true), 1);
}
else if( $act == 'update_top_ten' ) {
    $top_ten_user = json_decode(file_get_contents($config['file_top_ten']), true);
    if( empty($_POST['username']) || empty($_POST['point']) ) {
        show_data($top_ten_user, 1);
    }
    if( count($top_ten_user) == 0 ) {
        $top_ten_user[] = [
            'username' => $_POST['username'],
            'point' => $_POST['point']
        ];
        file_put_contents($config['file_top_ten'], json_encode($top_ten_user));
        show_data($top_ten_user, 1);
    }
    $is_user_eligible = false;
    $pop_user = [];
    foreach( $top_ten_user as $key => $user ) {
        if( !$is_user_eligible && (int) $_POST['point'] >= (int)$user['point'] ) {
            $pop_user = $user;
            $is_user_eligible = true;
            $top_ten_user[$key] = [
                'username' => $_POST['username'],
                'point' => $_POST['point']
            ];
        }
        else if( $is_user_eligible ) {
            $top_ten_user[$key] = $pop_user;
            $pop_user = $user;
        }
    }
    if( count($top_ten_user) < 10 ) {
        if( !$is_user_eligible ) {
            $top_ten_user[] = [
                'username' => $_POST['username'],
                'point' => $_POST['point']
            ];
        }
        else {
            $top_ten_user[] = $pop_user;
        }
    }
    else if( count($top_ten_user) > 10 ) {
        unset($top_ten_user[10]);
    }
    file_put_contents($config['file_top_ten'], json_encode($top_ten_user));
    show_data($top_ten_user, 1);
}
else if( $act == 'register_user' ) {
    $response = '';
    $username = $_POST['username'] ? trim($_POST['username']) : '';
    $username = str_replace('.', '_', $username);
    if( empty($username) ) {
        show_data('Please enter username');
    }
    $users = json_decode(file_get_contents($config['file_user_data']), true);
    if( in_array($username, $users) ) {
        show_data('username already exist. please choose another one.');
    }
    $users[] = $username;
    file_put_contents($config['file_user_data'], json_encode($users));
    show_data($username, 1);
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