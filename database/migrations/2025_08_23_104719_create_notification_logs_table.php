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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('customer_id'); // Use bigInteger to match pk_customer_id type
            $table->enum('channel', ['sms', 'whatsapp', 'email']);
            $table->enum('status', ['sent', 'delivered', 'failed', 'pending']);
            $table->string('recipient'); // Phone number or email
            $table->text('message');
            $table->string('subject')->nullable(); // For emails
            $table->string('campaign_name')->nullable();
            $table->json('metadata')->nullable(); // Store additional data like error messages
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('opened_at')->nullable(); // For email tracking
            $table->timestamp('clicked_at')->nullable(); // For link tracking
            $table->timestamps();
            
            // Indexes for performance
            $table->index('customer_id');
            $table->index('channel');
            $table->index('status');
            $table->index('sent_at');
            $table->index('campaign_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};