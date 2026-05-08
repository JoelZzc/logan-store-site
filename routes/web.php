<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Fallback for React Router routes in SPA.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
