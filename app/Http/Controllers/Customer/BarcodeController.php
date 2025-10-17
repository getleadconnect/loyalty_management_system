<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\CustomerPoint;
use App\Models\PointsTransaction;
use App\Models\ScannedQrcode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BarcodeController extends Controller
{
    /**
     * Scan barcode and get product details
     */
    public function scanBarcode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'barcode' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::where('barcode_value', $request->barcode)
                         ->where('is_active', true)
                         ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found or inactive'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'product' => [
                'id' => $product->id,
                'product_name' => $product->product_name,
                'points' => $product->points,
                'barcode_value' => $product->barcode_value
            ]
        ]);
    }

    /**
     * Process scanned product and add points
     */
    public function processScannedProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $product = Product::find($request->product_id);

        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Product is not active'
            ], 400);
        }

        $totalPoints = $product->points * $request->quantity;

        DB::beginTransaction();
        try {
            // Create customer points record
            $customerPoint = CustomerPoint::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'product_name' => $product->product_name,
                'points' => $product->points,
                'quantity' => $request->quantity,
                'total_points' => $totalPoints
            ]);

            // Update user's points balance
            $user->points_balance = ($user->points_balance ?? 0) + $totalPoints;
            $user->save();

            // Create points transaction record
            PointsTransaction::create([
                'user_id' => $user->id,
                'type' => 'earned',
                'points' => $totalPoints,
                'balance_after' => $user->points_balance,
                'description' => "Points earned from {$product->product_name} (Qty: {$request->quantity})"
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Points added successfully',
                'points_earned' => $totalPoints,
                'new_balance' => $user->points_balance,
                'transaction' => $customerPoint
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process points',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer's recent scanned products
     */
    public function getRecentScans(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 10);

        $recentScans = CustomerPoint::where('user_id', $user->id)
                                   ->with('product')
                                   ->orderBy('created_at', 'desc')
                                   ->paginate($perPage);

        return response()->json($recentScans);
    }

    /**
     * Get customer's scan statistics
     */
    public function getScanStats()
    {
        $user = auth()->user();

        $stats = [
            'total_scans' => ScannedQrcode::where('user_id', $user->id)->count(),
            'points_from_scans' => ScannedQrcode::where('user_id', $user->id)
                                                ->sum('points'),
            'today_scans' => ScannedQrcode::where('user_id', $user->id)
                                         ->whereDate('created_at', today())
                                         ->count(),
            'today_points' => ScannedQrcode::where('user_id', $user->id)
                                          ->whereDate('created_at', today())
                                          ->sum('points')
        ];

        return response()->json($stats);
    }

    /**
     * Scan QR code and validate it
     */
    public function scanQRCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $qrCode = $request->qr_code;

        // Split QR code by "-" delimiter
        $parts = explode('-', $qrCode);

        if (count($parts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR code format. Expected format: UNIQUEID-POINTS'
            ], 400);
        }

        $uniqueId = trim($parts[0]);
        $points = trim($parts[1]);

        // Validate points is numeric
        if (!is_numeric($points) || $points <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid points value in QR code'
            ], 400);
        }

        $points = (int) $points;

        // Check if this QR code has already been scanned by this user
        $existingScan = ScannedQrcode::where('user_id', $user->id)
                                     ->where('unique_id', $uniqueId)
                                     ->first();

        if ($existingScan) {
            return response()->json([
                'success' => false,
                'message' => 'This QR code has already been scanned by you on ' . $existingScan->created_at->format('M d, Y H:i:s')
            ], 400);
        }

        // Return success with the parsed data
        return response()->json([
            'success' => true,
            'unique_id' => $uniqueId,
            'points' => $points,
            'message' => 'QR code scanned successfully'
        ]);
    }

    /**
     * Process scanned QR code and add points
     */
    public function processQRCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'unique_id' => 'required|string',
            'points' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $uniqueId = $request->unique_id;
        $points = $request->points;

        // Double-check if this QR code has already been scanned by this user
        $existingScan = ScannedQrcode::where('user_id', $user->id)
                                     ->where('unique_id', $uniqueId)
                                     ->first();

        if ($existingScan) {
            return response()->json([
                'success' => false,
                'message' => 'This QR code has already been scanned by you'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Create scanned QR code record
            ScannedQrcode::create([
                'user_id' => $user->id,
                'unique_id' => $uniqueId,
                'points' => $points
            ]);

            // Update user's points balance
            $user->points_balance = ($user->points_balance ?? 0) + $points;
            $user->save();

            // Create points transaction record
            PointsTransaction::create([
                'user_id' => $user->id,
                'type' => 'earned',
                'points' => $points,
                'balance_after' => $user->points_balance,
                'description' => "Points earned from QR code scan (ID: {$uniqueId})"
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Points added successfully',
                'points_earned' => $points,
                'new_balance' => $user->points_balance
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}