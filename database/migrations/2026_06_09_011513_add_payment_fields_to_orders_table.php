<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('saved_cards')) {
            Schema::create('saved_cards', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('cardholder_name');
                $table->string('last_four', 4);
                $table->string('brand')->nullable();
                $table->integer('expiry_month');
                $table->integer('expiry_year');
                $table->string('token')->unique();
                $table->string('card_hash')->index();
                $table->timestamps();
            });
        }

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method')->default('cash'); // 'cash' or 'card'
            }
            if (!Schema::hasColumn('orders', 'card_last_four')) {
                $table->string('card_last_four', 4)->nullable();
            }
            if (!Schema::hasColumn('orders', 'card_brand')) {
                $table->string('card_brand')->nullable();
            }
            if (!Schema::hasColumn('orders', 'cardholder_name')) {
                $table->string('cardholder_name')->nullable();
            }
            if (Schema::hasColumn('orders', 'card_token')) {
                $table->dropColumn('card_token');
            }
            if (!Schema::hasColumn('orders', 'saved_card_id')) {
                $table->foreignId('saved_card_id')->nullable()->constrained('saved_cards')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'saved_card_id')) {
                $table->dropForeign(['saved_card_id']);
                $table->dropColumn('saved_card_id');
            }
            if (Schema::hasColumn('orders', 'cardholder_name')) {
                $table->dropColumn('cardholder_name');
            }
            if (Schema::hasColumn('orders', 'card_brand')) {
                $table->dropColumn('card_brand');
            }
            if (Schema::hasColumn('orders', 'card_last_four')) {
                $table->dropColumn('card_last_four');
            }
            if (Schema::hasColumn('orders', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });

        Schema::dropIfExists('saved_cards');
    }
};
