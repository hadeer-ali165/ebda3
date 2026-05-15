<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentPayment;
use App\Models\StudentTrack;
use App\Models\Track;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $request->user()->load('track');
        $trackId = (int) $user->track_id;
        $currentMonth = now()->startOfMonth();
        $studentTrackIds = StudentTrack::query()
            ->where('track_id', $trackId)
            ->pluck('id');

        $totalStudents = $studentTrackIds->count();

        $paidStudentTrackIds = StudentPayment::query()
            ->whereDate('month', $currentMonth->format('Y-m-01'))
            ->whereIn('student_track_id', $studentTrackIds)
            ->where('paid_amount', '>', 0)
            ->pluck('student_track_id')
            ->unique();

        $paidStudents = $paidStudentTrackIds->count();
        $unpaidStudents = max(0, $totalStudents - $paidStudents);

        return Inertia::render('Employee/Dashboard', [
            'track' => [
                'id' => $user->track_id,
                'name' => $user->track?->name ?? '-',
            ],
            'stats' => [
                'month_key' => $currentMonth->format('Y-m'),
                'total_students' => $totalStudents,
                'paid_subscriptions' => $paidStudents,
                'unpaid_subscriptions' => $unpaidStudents,
            ],
        ]);
    }

    public function students(Request $request): Response
    {
        $user = $request->user()->load('track');
        $trackId = (int) $user->track_id;

        $search = trim((string) $request->query('search', ''));
        $startMonth = $request->query('start_month', now()->startOfMonth()->format('Y-m'));
        $start = Carbon::createFromFormat('Y-m', $startMonth)->startOfMonth();

        $months = collect(range(0, 5))->map(function (int $index) use ($start) {
            $date = $start->copy()->addMonths($index);

            return [
                'key' => $date->format('Y-m'),
                'label' => $date->format('m/Y'),
            ];
        });

        $monthKeys = $months->pluck('key')->all();

        $enrollmentsQuery = StudentTrack::query()
            ->where('track_id', $trackId)
            ->with([
                'student',
                'track:id,name',
                'payments' => function ($paymentQuery) use ($monthKeys) {
                    $paymentQuery->where(function ($innerQuery) use ($monthKeys) {
                        foreach ($monthKeys as $monthKey) {
                            $innerQuery->orWhereDate('month', $monthKey.'-01');
                        }
                    });
                },
            ])
            ->whereHas('student', function ($query) use ($search) {
                if ($search !== '') {
                    $query->where('name', 'like', '%'.$search.'%');
                }
            });

        $students = $enrollmentsQuery
            ->get()
            ->sortBy(fn (StudentTrack $studentTrack) => $studentTrack->student?->name)
            ->values()
            ->map(function (StudentTrack $studentTrack) {
                $student = $studentTrack->student;

                if (! $student) {
                    return null;
                }

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'father_name' => $student->father_name,
                    'phone' => $student->phone,
                    'subscription_date' => $student->subscription_date->format('Y-m-d'),
                    'student_track_id' => $studentTrack->id,
                    'track_name' => $studentTrack->track?->name ?? '-',
                    'subscriptions' => $studentTrack->payments
                        ->groupBy(fn (StudentPayment $payment) => Carbon::parse($payment->month)->format('Y-m'))
                        ->map(fn ($payments) => $payments->max('paid_amount') > 0)
                        ->all(),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Employee/Students', [
            'track' => [
                'id' => $user->track_id,
                'name' => $user->track?->name ?? '-',
            ],
            'students' => $students,
            'months' => $months,
            'filters' => [
                'search' => $search,
            ],
            'previousStartMonth' => $start->copy()->subMonths(6)->format('Y-m'),
            'nextStartMonth' => $start->copy()->addMonths(6)->format('Y-m'),
        ]);
    }

    public function storeStudent(Request $request)
    {
        $user = $request->user();
        $trackId = (int) $user->track_id;

        $track = Track::query()->findOrFail($trackId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'father_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'subscription_date' => ['required', 'date'],
        ]);

        $student = Student::create([
            'name' => $validated['name'],
            'father_name' => $validated['father_name'],
            'phone' => $validated['phone'],
            'subscription_date' => $validated['subscription_date'],
        ]);

        $student->studentTracks()->create([
            'track_id' => $track->id,
            'monthly_fee' => $track->monthly_fee,
        ]);

        return back();
    }

    public function togglePayment(Request $request, StudentTrack $studentTrack)
    {
        $this->ensureTrackAccess($request, $studentTrack);

        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'paid' => ['required', 'boolean'],
        ]);

        $monthDate = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $monthDateString = $monthDate->toDateString();

        if ($validated['paid']) {
            StudentPayment::query()
                ->where('student_track_id', $studentTrack->id)
                ->whereDate('month', $monthDateString)
                ->delete();

            StudentPayment::create([
                'student_id' => $studentTrack->student_id,
                'student_track_id' => $studentTrack->id,
                'month' => $monthDateString,
                'paid_amount' => $studentTrack->monthly_fee,
            ]);
        } else {
            StudentPayment::query()
                ->where('student_track_id', $studentTrack->id)
                ->whereDate('month', $monthDateString)
                ->delete();
        }

        return back();
    }

    private function ensureTrackAccess(Request $request, StudentTrack $studentTrack): void
    {
        if ((int) $studentTrack->track_id !== (int) $request->user()->track_id) {
            abort(403, 'غير مصرح لك بالوصول لهذا الطالب.');
        }
    }
}
