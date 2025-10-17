<?php

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProductsImport implements ToCollection, WithHeadingRow, SkipsEmptyRows, WithValidation, SkipsOnFailure
{
    use SkipsFailures;
    
    public $importedCount = 0;
    public $updatedCount = 0;
    public $skippedCount = 0;
    public $errors = [];
    
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     * 
     * 
     * 
     */

    
    public function collection(Collection $collection)
    {
        foreach ($collection as $key => $row) {
            try {
                // Check for required fields
                if (!isset($row['product_name']) || !isset($row['points'])) {
                    $this->skippedCount++;
                    $this->errors[] = "Row " . ($key + 2) . ": Missing required fields (product_name or points)";
                    continue;
                }

                // Convert barcode to string if it's a number
                $barcode = isset($row['barcode']) ? (string)$row['barcode'] : null;
                
                $data = [
                    'product_name' => $row['product_name'],
                    'points' => $row['points'],
                    'barcode_value' => $barcode,
                    'is_active' => 1
                ];

                // Check if barcode already exists
                if (!empty($barcode)) {
                    $existingProduct = Product::where('barcode_value', $barcode)->first();
                    
                    if ($existingProduct) {
                        // Update existing product
                        $result = $existingProduct->update([
                            'product_name' => $row['product_name'],
                            'points' => $row['points']
                        ]);
                        $this->updatedCount++;
                    } else {
                        $this->importedCount++;
                        $result = Product::create($data);
                    }
                } else {
                    // Create product without barcode
                    $this->importedCount++;
                    $result = Product::create($data);
                }
            } catch (\Exception $e) {
                $this->skippedCount++;
                $this->errors[] = "Row " . ($key + 2) . ": " . $e->getMessage();
                Log::error('Product import row error: ' . $e->getMessage(), ['row' => $key + 2]);
            }
        }
    }

    
    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'product_name' => 'required|string|max:255',
            'points' => 'required|numeric|min:0',
            'barcode' => 'nullable|max:255' // Removed string validation as numbers are auto-converted
        ];
    }
    
    /**
     * Custom validation messages
     */
    public function customValidationMessages()
    {
        return [
            'product_name.required' => 'Product name is required',
            'points.required' => 'Points value is required',
            'points.numeric' => 'Points must be a number',
            'points.min' => 'Points cannot be negative'
        ];
    }
    
    /**
     * Handle a failed validation.
     * This method is automatically called when validation fails
     * because we're using SkipsOnFailure concern
     *
     * @param Failure ...$failures
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->skippedCount++;
            $errorMessage = "Row " . $failure->row() . ": " . implode(', ', $failure->errors());
            $this->errors[] = $errorMessage;
            Log::warning('Product import validation failure: ' . $errorMessage);
        }
    }
    
    /**
     * Batch insert size
     */
    public function batchSize(): int
    {
        return 100;
    }
    
    /**
     * Chunk reading size
     */
    public function chunkSize(): int
    {
        return 100;
    }
    
    /**
     * Get import results
     */
    public function getImportResults()
    {
        return [
            'imported' => $this->importedCount,
            'updated' => $this->updatedCount,
            'skipped' => $this->skippedCount,
            'failures' => $this->failures(),
            'errors' => $this->errors
        ];
    }
    
    /**
     * Get errors
     */
    public function getErrors()
    {
        return collect($this->errors);
    }
}