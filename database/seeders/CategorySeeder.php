<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Hombre',  'slug' => 'hombre'],
            ['name' => 'Mujer',   'slug' => 'mujer'],
            ['name' => 'Unisex',  'slug' => 'unisex'],
            ['name' => 'Niños',   'slug' => 'ninos'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
