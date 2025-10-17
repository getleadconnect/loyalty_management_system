<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaLink;
use App\Models\AdsImage;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /**
     * Get active social media links
     */
    public function getActiveSocialMediaLinks()
    {
        $links = SocialMediaLink::where('is_active', true)
            ->orderBy('order', 'asc')
            ->select('id', 'platform', 'url', 'icon')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $links
        ]);
    }

    /**
     * Get active ads images
     */
    public function getActiveAdsImages()
    {
        $ads = AdsImage::where('is_active', true)
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->select('id', 'image', 'description')
            ->get();
        
        // Add full URL for images
        $ads->transform(function ($ad) {
            $ad->image_url = asset($ad->image);
            return $ad;
        });
        
        return response()->json([
            'success' => true,
            'data' => $ads
        ]);
    }
}