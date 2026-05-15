<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@system.local'],
            [
                'name' => 'System Admin',
                'is_admin' => true,
                'password' => Hash::make('Admin@123456'),
            ],
        );
    }
}
