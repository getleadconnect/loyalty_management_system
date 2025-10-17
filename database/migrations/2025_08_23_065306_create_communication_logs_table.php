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
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('channel', ['sms', 'whatsapp', 'email']);
            $table->enum('type', ['individual', 'bulk', 'automated']);
            $table->foreignId('template_id')->nullable()->constrained('communication_templates');
            $table->unsignedBigInteger('segment_id')->nullable();
            $table->foreignId('sender_id')->nullable()->constrained('users');
            $table->json('recipients');
            $table->string('subject')->nullable();
            $table->text('content');
            $table->enum('status', ['pending', 'processing', 'sent', 'failed', 'partial']);
            $table->integer('total_recipients')->default(0);
            $table->integer('successful_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->json('error_details')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            
            $table->index(['channel', 'status']);
            $table->index(['type', 'created_at']);
            $table->index('sender_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
    }
};