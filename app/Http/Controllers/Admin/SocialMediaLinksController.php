<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SocialMediaLinksController extends Controller
{
    /**
     * Display a listing of social media links.
     */
    public function index()
    {
        $links = SocialMediaLink::orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $links
        ]);
    }

    /**
     * Store a newly created social media link.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|string|max:50',
            'url' => 'required|url|max:255',
            'icon' => 'nullable|string|max:50',
            'order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $link = SocialMediaLink::create([
            'platform' => $request->platform,
            'url' => $request->url,
            'icon' => $request->icon,
            'order' => $request->order ?? 0,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Social media link added successfully',
            'data' => $link
        ], 201);
    }

    /**
     * Display the specified social media link.
     */
    public function show($id)
    {
        $link = SocialMediaLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Social media link not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $link
        ]);
    }

    /**
     * Update the specified social media link.
     */
    public function update(Request $request, $id)
    {
        $link = SocialMediaLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Social media link not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'platform' => 'required|string|max:50',
            'url' => 'required|url|max:255',
            'icon' => 'nullable|string|max:50',
            'order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $link->update([
            'platform' => $request->platform,
            'url' => $request->url,
            'icon' => $request->icon,
            'order' => $request->order ?? $link->order,
            'is_active' => $request->is_active ?? $link->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Social media link updated successfully',
            'data' => $link
        ]);
    }

    /**
     * Remove the specified social media link.
     */
    public function destroy($id)
    {
        $link = SocialMediaLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Social media link not found'
            ], 404);
        }

        $link->delete();

        return response()->json([
            'success' => true,
            'message' => 'Social media link deleted successfully'
        ]);
    }

    /**
     * Toggle the active status of a social media link.
     */
    public function toggleStatus($id)
    {
        $link = SocialMediaLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Social media link not found'
            ], 404);
        }

        $link->is_active = !$link->is_active;
        $link->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $link
        ]);
    }
}