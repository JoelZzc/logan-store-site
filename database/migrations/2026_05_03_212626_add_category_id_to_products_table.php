<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // nullable() porque puede haber productos sin categoría aún
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained()    // apunta a tabla 'categories' automáticamente
                  ->nullOnDelete();  // si borras la categoría, el producto queda con null
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Category::class);
            $table->dropColumn('category_id');
        });
    }
};
