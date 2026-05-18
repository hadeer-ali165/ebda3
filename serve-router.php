<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$publicPath = __DIR__.'/public';

// Serve uploaded files from storage (fixes broken/outdated public/storage on Windows).
if (str_starts_with($uri, '/storage/')) {
    $relativePath = substr($uri, strlen('/storage/'));
    $storageFile = __DIR__.'/storage/app/public/'.$relativePath;

    if ($relativePath !== '' && file_exists($storageFile) && ! is_dir($storageFile)) {
        $mime = mime_content_type($storageFile) ?: 'application/octet-stream';
        header('Content-Type: '.$mime);
        header('Content-Length: '.(string) filesize($storageFile));
        readfile($storageFile);

        return true;
    }

    http_response_code(404);

    return true;
}

$requestedFile = $publicPath.$uri;

if ($uri !== '/' && file_exists($requestedFile) && ! is_dir($requestedFile)) {
    return false;
}

require_once $publicPath.'/index.php';
