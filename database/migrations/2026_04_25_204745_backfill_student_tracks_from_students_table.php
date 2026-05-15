<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $rows = DB::table('students')
            ->whereNotNull('track_id')
            ->get(['id', 'track_id', 'subscription_fee']);

        foreach ($rows as $row) {
            $exists = DB::table('student_tracks')
                ->where('student_id', $row->id)
                ->where('track_id', $row->track_id)
                ->exists();

            if (! $exists) {
                DB::table('student_tracks')->insert([
                    'student_id' => $row->id,
                    'track_id' => $row->track_id,
                    'monthly_fee' => $row->subscription_fee ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Backfill migration has no rollback.
    }
};
