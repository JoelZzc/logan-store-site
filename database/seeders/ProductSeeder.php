<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $hombre  = Category::where('slug', 'hombre')->first()->id;
        $mujer   = Category::where('slug', 'mujer')->first()->id;
        $unisex  = Category::where('slug', 'unisex')->first()->id;

        $chanel   = Brand::where('slug', 'chanel')->first()->id;
        $dior     = Brand::where('slug', 'dior')->first()->id;
        $versace  = Brand::where('slug', 'versace')->first()->id;
        $paco     = Brand::where('slug', 'paco-rabanne')->first()->id;
        $carolina = Brand::where('slug', 'carolina-herrera')->first()->id;
        $armani   = Brand::where('slug', 'giorgio-armani')->first()->id;
        $ysl      = Brand::where('slug', 'ysl')->first()->id;
        $dg       = Brand::where('slug', 'dolce-gabbana')->first()->id;

        $products = [
            // Hombre
            [
                'name'        => 'Bleu de Chanel Eau de Parfum',
                'description' => 'Fragancia fresca y amaderada, símbolo de la masculinidad moderna.',
                'price'       => 3100.00,
                'stock'       => 20,
                'min_stock'   => 5,
                'reorder_point' => 8,
                'category_id' => $hombre,
                'brand_id'    => $chanel,
                'image_url'   => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400',
            ],
            [
                'name'        => 'Sauvage Eau de Toilette',
                'description' => 'Notas de bergamota y pimienta de Sichuan con base de Ambroxan.',
                'price'       => 2800.00,
                'stock'       => 15,
                'min_stock'   => 4,
                'reorder_point' => 7,
                'category_id' => $hombre,
                'brand_id'    => $dior,
                'image_url'   => 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
            ],
            [
                'name'        => 'Eros Eau de Toilette',
                'description' => 'Fragancia intensa y seductora inspirada en el dios griego del amor.',
                'price'       => 1800.00,
                'stock'       => 12,
                'min_stock'   => 3,
                'reorder_point' => 6,
                'category_id' => $hombre,
                'brand_id'    => $versace,
                'image_url'   => 'https://i.imgur.com/Akw04dW.jpeg',
            ],
            [
                'name'        => '1 Million Eau de Toilette',
                'description' => 'Un aroma seductor y opulento con notas de canela y cuero.',
                'price'       => 2200.00,
                'stock'       => 10,
                'min_stock'   => 3,
                'reorder_point' => 5,
                'category_id' => $hombre,
                'brand_id'    => $paco,
                'image_url'   => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400',
            ],
            [
                'name'        => 'Acqua di Giò Eau de Toilette',
                'description' => 'Frescura mediterránea con notas marinas y cítricas.',
                'price'       => 2400.00,
                'stock'       => 8,
                'min_stock'   => 3,
                'reorder_point' => 5,
                'category_id' => $hombre,
                'brand_id'    => $armani,
                'image_url'   => 'https://images.unsplash.com/photo-1601295452898-4f08cbf79108?w=400',
            ],
            // Mujer
            [
                'name'        => 'Chanel N°5 Eau de Parfum',
                'description' => 'El perfume más icónico del mundo. Floral aldehydic atemporal.',
                'price'       => 3500.00,
                'stock'       => 18,
                'min_stock'   => 4,
                'reorder_point' => 7,
                'category_id' => $mujer,
                'brand_id'    => $chanel,
                'image_url'   => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
            ],
            [
                'name'        => 'Miss Dior Blooming Bouquet',
                'description' => 'Fragancia fresca y floral con notas de peonía y mandarina.',
                'price'       => 2900.00,
                'stock'       => 14,
                'min_stock'   => 4,
                'reorder_point' => 6,
                'category_id' => $mujer,
                'brand_id'    => $dior,
                'image_url'   => 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400',
            ],
            [
                'name'        => 'Good Girl Eau de Parfum',
                'description' => 'Contraste de flores blancas y cacao. Frasco con forma de tacón.',
                'price'       => 2600.00,
                'stock'       => 16,
                'min_stock'   => 4,
                'reorder_point' => 6,
                'category_id' => $mujer,
                'brand_id'    => $carolina,
                'image_url'   => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
            ],
            [
                'name'        => 'Black Opium Eau de Parfum',
                'description' => 'Café negro, vainilla blanca y flores blancas. Adictivo.',
                'price'       => 2700.00,
                'stock'       => 11,
                'min_stock'   => 3,
                'reorder_point' => 5,
                'category_id' => $mujer,
                'brand_id'    => $ysl,
                'image_url'   => 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400',
            ],
            // Unisex
            [
                'name'        => 'Light Blue Eau de Toilette',
                'description' => 'Cítrico mediterráneo fresco. Perfecto para el verano.',
                'price'       => 1950.00,
                'stock'       => 13,
                'min_stock'   => 3,
                'reorder_point' => 5,
                'category_id' => $unisex,
                'brand_id'    => $dg,
                'image_url'   => 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400',
            ],
            [
                'name'        => 'Chance Eau Tendre Eau de Toilette',
                'description' => 'Fresco, floral y romántico. Bouquet de pomelo y jazmín.',
                'price'       => 3100.00,
                'stock'       => 9,
                'min_stock'   => 2,
                'reorder_point' => 4,
                'category_id' => $unisex,
                'brand_id'    => $chanel,
                'image_url'   => 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=400',
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}
