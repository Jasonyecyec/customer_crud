<?php

return [
    'hosts' => [
        [
            // 'host' => env('ES_HOST', 'localhost'),
            'host' => env('ES_SCHEME', 'http') . '://' . env('ES_HOST', 'localhost') . ':' . env('ES_PORT', '9200'),
            'port' => env('ES_PORT', '9200'),
            'scheme' => env('ES_SCHEME', 'http'),
        ],
    ],
];