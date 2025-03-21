
<?php
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\CustomerController;
    
Route::get('/customers',[CustomerController::class,'index']);
Route::post('/customers',[CustomerController::class,'store']);
Route::get('/customers/{id}', [CustomerController::class, 'show']);
Route::patch('/customers/{id}', [CustomerController::class, 'update']);
Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
