<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeManagementController extends Controller
{
    public function index(): Response
    {
        $employees = User::query()
            ->where('is_admin', false)
            ->whereNotNull('track_id')
            ->with('track:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'track_id' => $user->track_id,
                'track_name' => $user->track?->name ?? '-',
            ]);

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'tracks' => Track::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'track_id' => ['required', 'integer', 'exists:tracks,id'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_admin' => false,
            'track_id' => $validated['track_id'],
        ]);

        return back();
    }

    public function update(Request $request, User $employee)
    {
        if ($employee->is_admin || ! $employee->track_id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($employee->id)],
            'password' => ['nullable', Password::defaults()],
            'track_id' => ['required', 'integer', 'exists:tracks,id'],
        ]);

        $employee->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'track_id' => $validated['track_id'],
        ]);

        if (! empty($validated['password'])) {
            $employee->password = Hash::make($validated['password']);
        }

        $employee->save();

        return back();
    }

    public function destroy(User $employee)
    {
        if ($employee->is_admin || ! $employee->track_id) {
            abort(404);
        }

        $employee->delete();

        return back();
    }
}
