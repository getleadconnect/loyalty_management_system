<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdsImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdsImagesController extends Controller
{
    /**
     * Display a listing of the ads images.
     */
    public function index()
    {
        $adsImages = AdsImage::orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $adsImages
        ]);
    }

    /**
     * Store a newly created ads image.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = 'ad_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // Create ads_images directory if it doesn't exist
            $uploadPath = public_path('ads_images');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            
            $image->move($uploadPath, $imageName);
            
            $adsImage = AdsImage::create([
                'image' => 'ads_images/' . $imageName,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'order' => $request->order ?? 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Advertisement image uploaded successfully',
                'data' => $adsImage
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file provided'
        ], 400);
    }

    /**
     * Display the specified ads image.
     */
    public function show($id)
    {
        $adsImage = AdsImage::find($id);
        
        if (!$adsImage) {
            return response()->json([
                'success' => false,
                'message' => 'Advertisement image not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $adsImage
        ]);
    }

    /**
     * Update the specified ads image.
     */
    public function update(Request $request, $id)
    {
        $adsImage = AdsImage::find($id);
        
        if (!$adsImage) {
            return response()->json([
                'success' => false,
                'message' => 'Advertisement image not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];
        
        // Handle image upload if new image is provided
        if ($request->hasFile('image')) {
            // Delete old image
            if ($adsImage->image && file_exists(public_path($adsImage->image))) {
                unlink(public_path($adsImage->image));
            }
            
            $image = $request->file('image');
            $imageName = 'ad_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            $uploadPath = public_path('ads_images');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            
            $image->move($uploadPath, $imageName);
            $updateData['image'] = 'ads_images/' . $imageName;
        }

        // Update other fields
        if ($request->has('description')) {
            $updateData['description'] = $request->description;
        }
        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->is_active;
        }
        if ($request->has('order')) {
            $updateData['order'] = $request->order;
        }

        $adsImage->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Advertisement image updated successfully',
            'data' => $adsImage->fresh()
        ]);
    }

    /**
     * Remove the specified ads image.
     */
    public function destroy($id)
    {
        $adsImage = AdsImage::find($id);
        
        if (!$adsImage) {
            return response()->json([
                'success' => false,
                'message' => 'Advertisement image not found'
            ], 404);
        }

        // Delete image file
        if ($adsImage->image && file_exists(public_path($adsImage->image))) {
            unlink(public_path($adsImage->image));
        }

        $adsImage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Advertisement image deleted successfully'
        ]);
    }

    /**
     * Toggle active status of ads image.
     */
    public function toggleStatus($id)
    {
        $adsImage = AdsImage::find($id);
        
        if (!$adsImage) {
            return response()->json([
                'success' => false,
                'message' => 'Advertisement image not found'
            ], 404);
        }

        $adsImage->is_active = !$adsImage->is_active;
        $adsImage->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $adsImage
        ]);
    }
}