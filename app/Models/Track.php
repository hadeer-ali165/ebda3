<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    protected $fillable = [
        'name',
        'monthly_fee',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
    ];

    public function studentTracks(): HasMany
    {
        return $this->hasMany(StudentTrack::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
