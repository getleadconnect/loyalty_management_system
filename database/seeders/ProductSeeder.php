<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'product_name' => 'Laptop',
                'points' => 500,
                'barcode_value' => '8901030901234',
                'is_active' => true
            ],
            [
                'product_name' => 'Smartphone',
                'points' => 300,
                'barcode_value' => '8901030901235',
                'is_active' => true
            ],
            [
                'product_name' => 'Headphones',
                'points' => 100,
                'barcode_value' => '8901030901236',
                'is_active' => true
            ],
            [
                'product_name' => 'Smart Watch',
                'points' => 200,
                'barcode_value' => '8901030901237',
                'is_active' => true
            ],
            [
                'product_name' => 'Tablet',
                'points' => 350,
                'barcode_value' => '8901030901238',
                'is_active' => true
            ],
            [
                'product_name' => 'Wireless Mouse',
                'points' => 50,
                'barcode_value' => '8901030901239',
                'is_active' => true
            ],
            [
                'product_name' => 'Keyboard',
                'points' => 75,
                'barcode_value' => '8901030901240',
                'is_active' => true
            ],
            [
                'product_name' => 'Monitor',
                'points' => 250,
                'barcode_value' => '8901030901241',
                'is_active' => true
            ],
            [
                'product_name' => 'USB Drive 32GB',
                'points' => 25,
                'barcode_value' => '8901030901242',
                'is_active' => true
            ],
            [
                'product_name' => 'Power Bank',
                'points' => 60,
                'barcode_value' => '8901030901243',
                'is_active' => false
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}