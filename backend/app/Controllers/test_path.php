<?php
$type = 'thumbnails';
$filename = 'thumbnail_6979c4dedbc8b_1769587934.png';
$path = __DIR__ . '/../storage/' . $type . '/' . $filename;
$realPath = realpath($path);
$storageRoot = realpath(__DIR__ . '/../storage/');

echo "Dir: " . __DIR__ . "\n";
echo "Attempted Path: $path\n";
echo "Real Path: " . ($realPath ?: "FALSE") . "\n";
echo "Storage Root: " . ($storageRoot ?: "FALSE") . "\n";
echo "File exists: " . (file_exists($realPath) ? "YES" : "NO") . "\n";

if ($realPath && $storageRoot) {
    $normalizedPath = str_replace('\\', '/', $realPath);
    $normalizedRoot = str_replace('\\', '/', $storageRoot);
    echo "Normalized Path: $normalizedPath\n";
    echo "Normalized Root: $normalizedRoot\n";
    echo "Strpos: " . strpos($normalizedPath, $normalizedRoot) . "\n";
}
