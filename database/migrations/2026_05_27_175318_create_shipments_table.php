<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('carrier');                          // DHL, FedEx, Estafeta, etc.
            $table->string('tracking_number')->nullable();      // número de rastreo
            $table->enum('status', ['pending', 'shipped', 'in_transit', 'delivered', 'failed'])
                  ->default('pending');
            $table->timestamp('shipped_at')->nullable();        // fecha de envío
            $table->timestamp('delivered_at')->nullable();      // fecha de entrega
            $table->text('notes')->nullable();                  // notas del envío
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
