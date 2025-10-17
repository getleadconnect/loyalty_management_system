<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

use App\Imports\ProductsImport;

class ProductController extends Controller
{
    /**
     * Display a listing of products with pagination
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $query = Product::query();

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('barcode_value', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'points' => 'required|integer|min:0',
            'barcode_value' => 'nullable|string|unique:products,barcode_value|max:255',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::create([
            'product_name' => $request->product_name,
            'points' => $request->points,
            'barcode_value' => $request->barcode_value,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
    }

    /**
     * Display the specified product
     */
    public function show($id)
    {
        $product = Product::findOrFail($id);
        
        return response()->json([
            'product' => $product
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_name' => 'sometimes|required|string|max:255',
            'points' => 'sometimes|required|integer|min:0',
            'barcode_value' => 'nullable|string|unique:products,barcode_value,' . $id . '|max:255',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->only(['product_name', 'points', 'barcode_value', 'is_active']));

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get product statistics
     */
    public function stats()
    {
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'inactive_products' => Product::where('is_active', false)->count(),
            'total_points_value' => Product::where('is_active', true)->sum('points'),
        ];

        return response()->json($stats);
    }

    /**
     * Toggle product active status
     */
    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'message' => 'Product status updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request)
    {
        $query = $request->get('query', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $products = Product::where(function($q) use ($query) {
                $q->where('product_name', 'like', "%{$query}%")
                  ->orWhere('barcode_value', 'like', "%{$query}%");
            })
            ->where('is_active', true)
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    /**
     * Bulk delete products
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Product::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => 'Products deleted successfully'
        ]);
    }

    /**
     * Import products from Excel/CSV file
     */


    public function import(Request $request)
    {

        // Custom validation for file types
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240' // Max 10MB
        ]);
        
        // Additional validation for file extension
        if (!$validator->fails()) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, ['csv', 'xlsx', 'xls'])) {
                return response()->json([
                    'errors' => ['file' => ['The file must be a CSV or Excel file (csv, xlsx, xls).']]
                ], 422);
            }
        }

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            
            // Log file details for debugging
            \Log::info('Product import file details', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension()
            ]);
            
            $import = new ProductsImport;
            
            // Determine reader type based on extension
            $extension = strtolower($file->getClientOriginalExtension());
            $readerType = null;
            
            if ($extension === 'xlsx') {
                $readerType = \Maatwebsite\Excel\Excel::XLSX;
            } elseif ($extension === 'xls') {
                $readerType = \Maatwebsite\Excel\Excel::XLS;
            } elseif ($extension === 'csv') {
                $readerType = \Maatwebsite\Excel\Excel::CSV;
            }
            
            // Check if ZIP extension is missing for XLSX files
            if (in_array($extension, ['xlsx', 'xls']) && !extension_loaded('zip')) {
                \Log::error('ZIP PHP extension is not installed. Cannot read Excel files.');
                return response()->json([
                    'success' => false,
                    'message' => 'Server configuration error: ZIP PHP extension is required to read Excel files. Please use CSV format instead.',
                    'error' => 'Missing PHP ZIP extension'
                ], 500);
            }
            
            // Import with specific reader type
            try {
                if ($readerType) {
                    Excel::import($import, $file, null, $readerType);
                } else {
                    Excel::import($import, $file);
                }
            } catch (\PhpOffice\PhpSpreadsheet\Reader\Exception $e) {
                // If reading fails, provide helpful error message
                \Log::error('PHPSpreadsheet reader error: ' . $e->getMessage());
                
                if ($extension === 'xlsx' || $extension === 'xls') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot read Excel file. Please try saving it as CSV format instead.',
                        'error' => 'Excel file reading failed'
                    ], 500);
                }
                throw $e;
            }

            // Get validation failures if any
            $validationFailures = [];
            if (method_exists($import, 'failures')) {
                foreach ($import->failures() as $failure) {
                    $validationFailures[] = 'Row ' . $failure->row() . ': ' . implode(', ', $failure->errors());
                }
            }
            
            // Combine errors and validation failures
            $allErrors = array_merge($import->errors, $validationFailures);
            
            return response()->json([
                'success' => true,
                'message' => 'Import completed successfully',
                'data' => [
                    'imported' => $import->importedCount,
                    'updated' => $import->updatedCount,
                    'skipped' => $import->skippedCount,
                    'errors' => $allErrors
                ]
            ], 200);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = 'Row ' . $failure->row() . ': ' . implode(', ', $failure->errors());
            }
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $errors
            ], 422);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage() ?: 'Unknown error occurred';
            $errorDetails = [
                'message' => $errorMessage,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ];
            
            \Log::error('Product import error: ' . $errorMessage, $errorDetails);
            
            // Check for specific error types
            if (strpos($errorMessage, 'Unable to identify a reader') !== false) {
                $errorMessage = 'Invalid file format. Please upload a valid CSV or Excel file.';
            } elseif (strpos($errorMessage, 'could not be converted') !== false) {
                $errorMessage = 'File format error. Please ensure your file is a valid CSV or Excel file.';
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $errorMessage,
                'error' => $errorMessage,
                'debug' => config('app.debug') ? $errorDetails : null
            ], 500);
        }
    }

      /**
     * Export products to CSV
     */
    public function export(Request $request)
    {
        $products = Product::select('product_name', 'points', 'barcode_value as barcode')
                          ->orderBy('product_name')
                          ->get();
        
        $csvFileName = 'products_' . date('Y-m-d_His') . '.csv';
        $headers = ['Product Name', 'Points', 'Barcode'];
        
        $callback = function() use ($products, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            
            foreach ($products as $product) {
                fputcsv($file, [
                    $product->product_name,
                    $product->points,
                    $product->barcode
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename={$csvFileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ]);
    }
    
}