<?php
// backend/public/check_limit.php
header('Content-Type: text/plain');
echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "\n";
echo "Post Max Size: " . ini_get('post_max_size') . "\n";
echo "Max Input Time: " . ini_get('max_input_time') . "\n";
echo "Max Execution Time: " . ini_get('max_execution_time') . "\n";
