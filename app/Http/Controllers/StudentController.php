<?php

namespace App\Http\Controllers;

use App\Exports\StudentsExport;
use App\Models\AppSetting;
use App\Models\Student;
use App\Models\StudentPayment;
use App\Models\StudentTrack;
use App\Models\Track;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function dashboard(): Response
    {
        $currentMonth = now()->startOfMonth();
        $monthKey = $currentMonth->format('Y-m');

        $totalStudents = Student::query()->count();
        $totalTracks = Track::query()->count();
        $newStudentsThisMonth = Student::query()
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $paidStudentIdsThisMonth = StudentPayment::query()
            ->whereDate('month', $currentMonth->format('Y-m-01'))
            ->join('student_tracks', 'student_tracks.id', '=', 'student_payments.student_track_id')
            ->pluck('student_tracks.student_id')
            ->unique();

        $paidStudentsThisMonth = $paidStudentIdsThisMonth->count();
        $unpaidStudentsThisMonth = max(0, $totalStudents - $paidStudentsThisMonth);

        $monthStart = $currentMonth->copy()->startOfMonth()->format('Y-m-d');
        $monthEnd = $currentMonth->copy()->endOfMonth()->format('Y-m-d');

        $totalRevenueThisMonth = (float) StudentPayment::query()
            ->whereDate('month', '>=', $monthStart)
            ->whereDate('month', '<=', $monthEnd)
            ->sum('paid_amount');

        $expectedRevenueThisMonth = (float) StudentTrack::query()->sum('monthly_fee');

        $dailyRevenueRows = StudentPayment::query()
            ->selectRaw('DATE(month) as day, SUM(paid_amount) as total')
            ->whereDate('month', '>=', $monthStart)
            ->whereDate('month', '<=', $monthEnd)
            ->groupByRaw('DATE(month)')
            ->orderByRaw('DATE(month)')
            ->get();

        $dailyRevenueByDay = $dailyRevenueRows
            ->mapWithKeys(fn ($row) => [Carbon::parse($row->day)->format('Y-m-d') => (float) $row->total]);

        $dailyRevenue = collect(range(1, $currentMonth->daysInMonth))->map(function (int $day) use ($currentMonth, $dailyRevenueByDay) {
            $date = $currentMonth->copy()->day($day)->format('Y-m-d');

            return [
                'day' => $day,
                'amount' => $dailyRevenueByDay[$date] ?? 0.0,
            ];
        });

        $trackRevenue = Track::query()
            ->leftJoin('student_tracks', 'student_tracks.track_id', '=', 'tracks.id')
            ->leftJoin('student_payments', function ($join) use ($monthStart, $monthEnd) {
                $join->on('student_payments.student_track_id', '=', 'student_tracks.id')
                    ->whereBetween('student_payments.month', [$monthStart, $monthEnd]);
            })
            ->groupBy('tracks.id', 'tracks.name')
            ->orderByDesc(DB::raw('COALESCE(SUM(student_payments.paid_amount),0)'))
            ->get([
                'tracks.id',
                'tracks.name',
                DB::raw('COALESCE(SUM(student_payments.paid_amount),0) as revenue'),
            ])
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'revenue' => (float) $row->revenue,
            ]);

        $trackAnalytics = Track::query()
            ->withCount('studentTracks')
            ->orderByDesc('student_tracks_count')
            ->get()
            ->map(fn (Track $track) => [
                'id' => $track->id,
                'name' => $track->name,
                'students_count' => $track->student_tracks_count,
            ]);

        $recentStudents = Student::query()
            ->with('studentTracks.track')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'track_name' => $student->studentTracks->pluck('track.name')->filter()->join('، '),
                'created_at' => $student->created_at?->format('Y-m-d'),
            ]);

        return Inertia::render('Students/Dashboard', [
            'stats' => [
                'month_key' => $monthKey,
                'total_students' => $totalStudents,
                'total_tracks' => $totalTracks,
                'new_students_this_month' => $newStudentsThisMonth,
                'paid_students_this_month' => $paidStudentsThisMonth,
                'unpaid_students_this_month' => $unpaidStudentsThisMonth,
                'total_revenue_this_month' => $totalRevenueThisMonth,
                'expected_revenue_this_month' => $expectedRevenueThisMonth,
            ],
            'trackAnalytics' => $trackAnalytics,
            'recentStudents' => $recentStudents,
            'dailyRevenue' => $dailyRevenue,
            'trackRevenue' => $trackRevenue,
        ]);
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $trackId = $request->query('track_id');
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

        $studentsQuery = Student::query()
            ->with(['studentTracks.track', 'studentTracks.payments' => function ($query) use ($monthKeys) {
                $query->where(function ($innerQuery) use ($monthKeys) {
                    foreach ($monthKeys as $monthKey) {
                        $innerQuery->orWhereDate('month', $monthKey.'-01');
                    }
                });
            }]);

        if ($search !== '') {
            $studentsQuery->where('name', 'like', '%'.$search.'%');
        }

        if (! empty($trackId)) {
            $studentsQuery->whereHas('studentTracks', fn ($query) => $query->where('track_id', $trackId));
        }

        $students = $studentsQuery
            ->orderBy('name')
            ->get()
            ->map(function (Student $student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'father_name' => $student->father_name,
                    'phone' => $student->phone,
                    'subscription_date' => $student->subscription_date->format('Y-m-d'),
                    'tracks' => $student->studentTracks->map(function (StudentTrack $studentTrack) {
                        return [
                            'id' => $studentTrack->id,
                            'track_id' => $studentTrack->track_id,
                            'track_name' => $studentTrack->track?->name ?? '-',
                            'monthly_fee' => (float) $studentTrack->monthly_fee,
                            'payments' => $studentTrack->payments
                                ->groupBy(fn (StudentPayment $payment) => Carbon::parse($payment->month)->format('Y-m'))
                                ->map(fn ($payments) => (float) $payments->max('paid_amount'))
                                ->all(),
                        ];
                    }),
                ];
            });

        return Inertia::render('Students/IndexMulti', [
            'students' => $students,
            'months' => $months,
            'tracks' => Track::query()->orderBy('name')->get(['id', 'name', 'monthly_fee']),
            'filters' => [
                'search' => $search,
                'track_id' => $trackId ? (int) $trackId : null,
            ],
            'previousStartMonth' => $start->copy()->subMonths(6)->format('Y-m'),
            'nextStartMonth' => $start->copy()->addMonths(6)->format('Y-m'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'father_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'track_ids' => ['required', 'array', 'min:1'],
            'track_ids.*' => ['required', 'integer', 'exists:tracks,id'],
            'subscription_date' => ['required', 'date'],
        ]);

        $student = Student::create([
            'name' => $validated['name'],
            'father_name' => $validated['father_name'],
            'phone' => $validated['phone'],
            'subscription_date' => $validated['subscription_date'],
        ]);

        $tracks = Track::query()
            ->whereIn('id', $validated['track_ids'])
            ->get(['id', 'monthly_fee']);

        $student->studentTracks()->createMany(
            $tracks->map(fn (Track $track) => [
                'track_id' => $track->id,
                'monthly_fee' => $track->monthly_fee,
            ])->all(),
        );

        return back();
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'father_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'track_ids' => ['required', 'array', 'min:1'],
            'track_ids.*' => ['required', 'integer', 'exists:tracks,id'],
            'subscription_date' => ['required', 'date'],
        ]);

        $student->update([
            'name' => $validated['name'],
            'father_name' => $validated['father_name'],
            'phone' => $validated['phone'],
            'subscription_date' => $validated['subscription_date'],
        ]);

        $targetTrackIds = collect($validated['track_ids'])->map(fn ($id) => (int) $id);
        $existingTrackIds = $student->studentTracks()->pluck('track_id');

        $idsToDelete = $existingTrackIds->diff($targetTrackIds);
        $idsToAdd = $targetTrackIds->diff($existingTrackIds);

        if ($idsToDelete->isNotEmpty()) {
            $student->studentTracks()->whereIn('track_id', $idsToDelete->all())->delete();
        }

        if ($idsToAdd->isNotEmpty()) {
            $tracksToAdd = Track::query()->whereIn('id', $idsToAdd->all())->get(['id', 'monthly_fee']);
            $student->studentTracks()->createMany(
                $tracksToAdd->map(fn (Track $track) => [
                    'track_id' => $track->id,
                    'monthly_fee' => $track->monthly_fee,
                ])->all(),
            );
        }

        return back();
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return back();
    }

    public function storeTrack(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tracks,name'],
            'monthly_fee' => ['required', 'numeric', 'min:0'],
        ]);

        Track::create($validated);

        return back();
    }

    public function updateTrack(Request $request, Track $track)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tracks,name,'.$track->id],
            'monthly_fee' => ['required', 'numeric', 'min:0'],
        ]);

        $track->update($validated);

        // Keep existing student-track prices synced with track price by default.
        $track->studentTracks()->update(['monthly_fee' => $track->monthly_fee]);

        return back();
    }

    public function destroyTrack(Track $track)
    {
        if ($track->studentTracks()->exists()) {
            throw ValidationException::withMessages([
                'track_delete' => 'لا يمكن حذف تراك مرتبط بطلاب. احذفيه من الطلاب أولا.',
            ]);
        }

        $track->delete();

        return back();
    }

    public function togglePayment(Request $request, StudentTrack $studentTrack)
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'paid' => ['nullable', 'boolean'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $monthDate = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $monthDateString = $monthDate->toDateString();
        $paidAmount = array_key_exists('paid', $validated)
            ? ((bool) $validated['paid'] ? (float) $studentTrack->monthly_fee : 0.0)
            : (float) ($validated['paid_amount'] ?? 0);

        if ($paidAmount > 0) {
            StudentPayment::query()
                ->where('student_track_id', $studentTrack->id)
                ->whereDate('month', $monthDateString)
                ->delete();

            StudentPayment::create([
                'student_id' => $studentTrack->student_id,
                'student_track_id' => $studentTrack->id,
                'month' => $monthDateString,
                'paid_amount' => $paidAmount,
            ]);
        } else {
            StudentPayment::query()
                ->where('student_track_id', $studentTrack->id)
                ->whereDate('month', $monthDateString)
                ->delete();
        }

        return back();
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $trackId = $request->query('track_id');

        return Excel::download(
            new StudentsExport($search, $trackId ? (int) $trackId : null),
            'students.xlsx',
        );
    }

    public function updateBranding(Request $request)
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'غير مصرح لك بتغيير اللوجو.');
        }

        $validated = $request->validate([
            'logo' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp,svg'],
        ]);

        $oldLogoPath = AppSetting::query()->where('key', 'branding_logo_path')->value('value');
        if ($oldLogoPath) {
            Storage::disk('public')->delete($oldLogoPath);
        }

        $path = $validated['logo']->store('branding', 'public');

        AppSetting::updateOrCreate(
            ['key' => 'branding_logo_path'],
            ['value' => $path],
        );

        return back();
    }
}
