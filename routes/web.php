<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('dashboard');
    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
    Route::post('/tracks', [StudentController::class, 'storeTrack'])->name('tracks.store');
    Route::put('/tracks/{track}', [StudentController::class, 'updateTrack'])->name('tracks.update');
    Route::delete('/tracks/{track}', [StudentController::class, 'destroyTrack'])->name('tracks.destroy');
    Route::put('/student-tracks/{studentTrack}/payments', [StudentController::class, 'togglePayment'])->name('student-tracks.payments.toggle');
    Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
    Route::post('/settings/branding', [StudentController::class, 'updateBranding'])->name('settings.branding.update');

    Route::get('/employees', [EmployeeManagementController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeManagementController::class, 'store'])->name('employees.store');
    Route::put('/employees/{employee}', [EmployeeManagementController::class, 'update'])->name('employees.update');
    Route::delete('/employees/{employee}', [EmployeeManagementController::class, 'destroy'])->name('employees.destroy');
});

Route::middleware(['auth', 'employee'])->prefix('employee')->name('employee.')->group(function () {
    Route::get('/dashboard', [EmployeeController::class, 'dashboard'])->name('dashboard');
    Route::get('/students', [EmployeeController::class, 'students'])->name('students.index');
    Route::post('/students', [EmployeeController::class, 'storeStudent'])->name('students.store');
    Route::put('/student-tracks/{studentTrack}/payments', [EmployeeController::class, 'togglePayment'])->name('student-tracks.payments.toggle');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
