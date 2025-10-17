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
        Schema::create('whatsapp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('provider'); // twilio, whatsapp_business, ultramsg, etc.
            $table->string('api_key');
            $table->string('api_secret')->nullable();
            $table->string('phone_number')->nullable(); // WhatsApp phone number
            $table->string('business_id')->nullable(); // WhatsApp Business ID
            $table->string('webhook_url')->nullable();
            $table->string('api_url')->nullable();
            $table->boolean('is_active')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_settings');
    }
};