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
        if (! Schema::hasColumn('student_payments', 'student_track_id')) {
            Schema::table('student_payments', function (Blueprint $table) {
                $table->foreignId('student_track_id')->nullable()->after('id')->constrained('student_tracks')->cascadeOnDelete();
            });
        }

        if (! Schema::hasColumn('student_payments', 'paid_amount')) {
            Schema::table('student_payments', function (Blueprint $table) {
                $table->decimal('paid_amount', 10, 2)->default(0)->after('month');
            });
        }

        try {
            Schema::table('student_payments', function (Blueprint $table) {
                $table->unique(['student_track_id', 'month']);
            });
        } catch (\Throwable) {
            // Ignore if unique index already exists.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('student_payments', 'student_track_id')) {
            Schema::table('student_payments', function (Blueprint $table) {
                $table->dropConstrainedForeignId('student_track_id');
            });
        }

        if (Schema::hasColumn('student_payments', 'paid_amount')) {
            Schema::table('student_payments', function (Blueprint $table) {
                $table->dropColumn('paid_amount');
            });
        }

        try {
            Schema::table('student_payments', function (Blueprint $table) {
                $table->unique(['student_id', 'month']);
            });
        } catch (\Throwable) {
            // Ignore if unique index already exists.
        }
    }
};
