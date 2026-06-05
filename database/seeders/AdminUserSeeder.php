<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@loganstore.com'],
            [
                'name'     => 'Administrador',
                'email'    => 'admin@loganstore.com',
                'password' => Hash::make('admin123456'),
                'role'     => 'admin',
            ]
        );
    }
}
