<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'name',
        'father_name',
        'phone',
        'subscription_date',
    ];

    protected $casts = [
        'subscription_date' => 'date',
    ];

    public function studentTracks(): HasMany
    {
        return $this->hasMany(StudentTrack::class);
    }
}
