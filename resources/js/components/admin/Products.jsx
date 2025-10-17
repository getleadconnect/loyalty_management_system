import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { adminAPI } from '../../services/api';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  Check,
  X,
  MoreVertical,
  Barcode,
  Coins,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';

const Products = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Configure toastr
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
  };
  
  // Products state
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  
  // Dialog states
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  // Form state
  const [productForm, setProductForm] = useState({
    product_name: '',
    points: '',
    barcode_value: '',
    is_active: true
  });

  useEffect(() => {
    loadProducts();
    loadProductStats();
  }, [currentPage, searchQuery, perPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts({
        page: currentPage,
        per_page: perPage,
        search: searchQuery
      });
      
      setProducts(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotal(response.data.total || 0);
      setFrom(response.data.from || 0);
      setTo(response.data.to || 0);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductStats = async () => {
    try {
      const response = await adminAPI.getProductStats();
      setProductStats(response.data);
    } catch (err) {
      console.error('Failed to load product stats:', err);
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.product_name || !productForm.points) {
      toastr.error('Product name and points are required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, productForm);
        toastr.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(productForm);
        toastr.success('Product created successfully');
      }
      
      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        product_name: '',
        points: '',
        barcode_value: '',
        is_active: true
      });
      loadProducts();
      loadProductStats();
    } catch (err) {
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Failed to save product';
      toastr.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteProduct(productToDelete.id);
      toastr.success('Product deleted successfully');
      setShowDeleteDialog(false);
      setProductToDelete(null);
      loadProducts();
      loadProductStats();
    } catch (err) {
      toastr.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await adminAPI.toggleProductStatus(product.id);
      toastr.success(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`);
      loadProducts();
      loadProductStats();
    } catch (err) {
      toastr.error('Failed to update product status');
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_name: product.product_name,
      points: product.points,
      barcode_value: product.barcode_value || '',
      is_active: product.is_active
    });
    setShowProductDialog(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setProductForm({
      product_name: '',
      points: '',
      barcode_value: '',
      is_active: true
    });
    setShowProductDialog(true);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      
      // Check file extension
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        toastr.error('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // File is valid
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toastr.error('Please select a file to import');
      return;
    }

    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await adminAPI.importProducts(formData);
      
      if (response.data.success) {
        toastr.success('Products successfully imported!');
        
        if (response.data.data && response.data.data.skipped > 0) {
          toastr.warning(`${response.data.data.skipped} rows were skipped.`);
        }
        
        if (response.data.data && response.data.data.errors && response.data.data.errors.length > 0) {
          response.data.data.errors.forEach(error => {
            toastr.warning(error);
          });
        }
        
        setImportResults(response.data);
        loadProducts();
        loadProductStats();
        
        // Reset import state after successful import
        setTimeout(() => {
          setShowImportDialog(false);
          setImportFile(null);
          setImportResults(null);
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to import products';
      toastr.error(errorMessage);
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content with headers
    const csvContent = "product_name,points,barcode\n" +
                      "Sample Product 1,100,123456789\n" +
                      "Sample Product 2,50,987654321\n" +
                      "Sample Product 3,75,";
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toastr.success('Template downloaded successfully');
  };

  const exportProducts = async () => {
    try {
      const response = await adminAPI.exportProducts();
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toastr.success('Products exported successfully');
    } catch (error) {
      toastr.error('Failed to export products');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage products and their point values</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Products
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-[#0284c7] hover:bg-[#0369a1] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {productStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Products</p>
                  <p className="text-xl sm:text-2xl font-bold">{productStats.total_products}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-xl sm:text-2xl font-bold">{productStats.active_products}</p>
                </div>
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Inactive</p>
                  <p className="text-xl sm:text-2xl font-bold">{productStats.inactive_products}</p>
                </div>
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Points Value</p>
                  <p className="text-lg sm:text-2xl font-bold">{productStats.total_points_value?.toLocaleString()}</p>
                </div>
                <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg sm:text-xl">Product List</CardTitle>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Show:</Label>
              <select 
                className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md text-sm"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {/* Mobile View - Cards */}
          <div className="block sm:hidden space-y-3 px-4">
            {products.length > 0 ? (
              products.map((product, index) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{(currentPage - 1) * perPage + index + 1}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          {product.product_name}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(product)}
                            className={product.is_active ? 'text-orange-600' : 'text-green-600'}
                          >
                            {product.is_active ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Points:</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <Coins className="h-3 w-3 text-yellow-500" />
                          {product.points}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Barcode:</span>
                        <div className="font-mono text-xs">
                          {product.barcode_value || '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      Created: {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No products found matching your search.' : 'No products found. Add your first product!'}
              </div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-sm">S.No</th>
                  <th className="text-left p-3 font-medium text-sm">Product Name</th>
                  <th className="text-left p-3 font-medium text-sm">Points</th>
                  <th className="text-left p-3 font-medium text-sm">Barcode</th>
                  <th className="text-left p-3 font-medium text-sm">Status</th>
                  <th className="text-left p-3 font-medium text-sm">Created At</th>
                  <th className="text-left p-3 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-600 text-sm">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-sm">{product.product_name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-sm">{product.points}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {product.barcode_value ? (
                          <div className="flex items-center gap-1">
                            <Barcode className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono">{product.barcode_value}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(product)}
                              className={product.is_active ? 'text-orange-600' : 'text-green-600'}
                            >
                              {product.is_active ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setProductToDelete(product);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No products found matching your search.' : 'No products found. Add your first product!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {from} to {to} of {total} entries
                {searchQuery && ' (filtered)'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>
                
                {totalPages > 1 && (
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`text-xs sm:text-sm ${pageNum === currentPage ? "bg-[#0284c7] hover:bg-[#0369a1]" : ""}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={productForm.product_name}
                onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                placeholder="Enter product name"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={productForm.points}
                onChange={(e) => setProductForm({ ...productForm, points: e.target.value })}
                placeholder="Enter point value"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="barcode_value">Barcode Value</Label>
              <Input
                id="barcode_value"
                value={productForm.barcode_value}
                onChange={(e) => setProductForm({ ...productForm, barcode_value: e.target.value })}
                placeholder="Enter barcode (optional)"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Enter the product's barcode for scanning
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={productForm.is_active}
                onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Product is active
              </Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowProductDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProduct} 
              className="bg-[#0284c7] hover:bg-[#0369a1] w-full sm:w-auto" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95%] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              {productToDelete && (
                <span className="font-semibold"> "{productToDelete.product_name}"</span>
              )}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setProductToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Products
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Upload a file with the following columns:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>product_name</strong> - Name of the product (required)</li>
                <li><strong>points</strong> - Point value (required)</li>
                <li><strong>barcode</strong> - Barcode value (optional)</li>
              </ul>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">Recommended: Use CSV/XLSX format (.csv/.xlsx) file only.</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>To create new Excel file and set data to the file</li>
                    <li>Or download template and add data to the file.</li>
                    <li>Then select file for import and click "Import"</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="import-file">Select File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv, .xlsx, .xls, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleImportFile}
                disabled={importLoading}
              />
              {importFile && (
                <p className="text-sm text-gray-600">
                  Selected: {importFile.name}
                </p>
              )}
            </div>
            
            {importResults && (
              <Alert className={importResults.imported_count > 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p>Imported: {importResults.imported_count} products</p>
                    {importResults.skipped_count > 0 && (
                      <p>Skipped: {importResults.skipped_count} rows</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportFile(null);
                setImportResults(null);
              }}
              disabled={importLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || importLoading}
              className="bg-[#0284c7] hover:bg-[#0369a1]"
            >
              {importLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;