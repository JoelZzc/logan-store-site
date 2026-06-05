<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'min_stock')) {
                $table->integer('min_stock')->default(5)->after('stock');
            }
            if (!Schema::hasColumn('products', 'reorder_point')) {
                $table->integer('reorder_point')->default(10)->after('min_stock');
            }
            if (!Schema::hasColumn('products', 'supplier_notes')) {
                $table->text('supplier_notes')->nullable()->after('reorder_point');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('products', 'min_stock'))      $cols[] = 'min_stock';
            if (Schema::hasColumn('products', 'reorder_point'))  $cols[] = 'reorder_point';
            if (Schema::hasColumn('products', 'supplier_notes')) $cols[] = 'supplier_notes';
            if (!empty($cols)) $table->dropColumn($cols);
        });
    }
};
