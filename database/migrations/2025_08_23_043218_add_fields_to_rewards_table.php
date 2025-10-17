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
        Schema::table('rewards', function (Blueprint $table) {
            // Add category field if it doesn't exist
            if (!Schema::hasColumn('rewards', 'category')) {
                $table->string('category', 100)->nullable()->after('points_required');
            }
            
            // Add terms_conditions field if it doesn't exist
            if (!Schema::hasColumn('rewards', 'terms_conditions')) {
                $table->text('terms_conditions')->nullable()->after('valid_until');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            if (Schema::hasColumn('rewards', 'category')) {
                $table->dropColumn('category');
            }
            
            if (Schema::hasColumn('rewards', 'terms_conditions')) {
                $table->dropColumn('terms_conditions');
            }
        });
    }
};