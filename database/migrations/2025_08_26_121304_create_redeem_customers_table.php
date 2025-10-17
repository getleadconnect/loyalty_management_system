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
        Schema::create('redeem_customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('rewards_id');
            $table->string('rewards_name');
            $table->integer('redeem_points');
            $table->integer('redeem_status')->default(1);
            $table->timestamp('verified_at')->nullable();
            $table->integer('delivery_status')->default(0);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('rewards_id')->references('id')->on('rewards')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
            $table->index('redeem_status');
            $table->index('delivery_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redeem_customers');
    }
};
