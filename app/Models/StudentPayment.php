<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class StudentPayment extends Model
{
    protected $fillable = [
        'student_id',
        'student_track_id',
        'month',
        'paid_amount',
    ];

    protected $casts = [
        'month' => 'date',
        'paid_amount' => 'decimal:2',
    ];

    public function studentTrack(): BelongsTo
    {
        return $this->belongsTo(StudentTrack::class);
    }
}
