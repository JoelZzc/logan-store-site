<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Chanel',        'slug' => 'chanel'],
            ['name' => 'Dior',          'slug' => 'dior'],
            ['name' => 'Versace',       'slug' => 'versace'],
            ['name' => 'Paco Rabanne',  'slug' => 'paco-rabanne'],
            ['name' => 'Carolina Herrera', 'slug' => 'carolina-herrera'],
            ['name' => 'Giorgio Armani','slug' => 'giorgio-armani'],
            ['name' => 'Yves Saint Laurent', 'slug' => 'ysl'],
            ['name' => 'Dolce & Gabbana', 'slug' => 'dolce-gabbana'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(['slug' => $brand['slug']], $brand);
        }
    }
}
