<?php  

$user_info = json_decode(file_get_contents('bs_tr_data.txt'), true);

echo '<pre>';
print_r($user_info);


?>