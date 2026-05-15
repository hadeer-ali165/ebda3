<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StudentsExport implements FromCollection, WithHeadings
{
    public function __construct(
        private readonly string $search = '',
        private readonly ?int $trackId = null,
    ) {
    }

    public function collection()
    {
        $query = Student::query()
            ->with(['studentTracks.track', 'studentTracks.payments'])
            ->orderBy('name');

        if ($this->search !== '') {
            $query->where('name', 'like', '%'.$this->search.'%');
        }

        if ($this->trackId !== null) {
            $query->whereHas('studentTracks', fn ($q) => $q->where('track_id', $this->trackId));
        }

        return $query->get()->map(function (Student $student) {
            $tracks = $student->studentTracks->map(
                fn ($studentTrack) => ($studentTrack->track?->name ?? '-').' ('.$studentTrack->monthly_fee.')'
            )->implode(' | ');

            $paidMonths = $student->studentTracks
                ->flatMap(fn ($studentTrack) => $studentTrack->payments->map(
                    fn ($payment) => ($studentTrack->track?->name ?? '-').': '.$payment->month->format('Y-m').'='.$payment->paid_amount
                ))
                ->implode(' | ');

            return [
                'name' => $student->name,
                'father_name' => $student->father_name,
                'phone' => $student->phone,
                'tracks' => $tracks,
                'subscription_date' => $student->subscription_date?->format('Y-m-d'),
                'paid_months' => $paidMonths,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Guardian Name',
            'Phone',
            'Tracks (with monthly fee)',
            'Subscription Date',
            'Payments details',
        ];
    }
}
