import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";
import { Switch } from "../components/switch";
import { LayoutDashboard, LogOut, Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Logo from "../assets/shawarmore-logo.jpeg";
const AdminProducts = () => {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    is_available: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, {
        ...productForm,
        price: parseFloat(productForm.price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Product added successfully!");
      setShowAddProduct(false);
      setProductForm({ name: "", description: "", price: "", image_url: "", category_id: "", is_available: true });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add product");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/products/${editingProduct}`, {
        ...productForm,
        price: parseFloat(productForm.price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", image_url: "", category_id: "", is_available: true });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete product");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/categories`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Category added successfully!");
      setShowAddCategory(false);
      setCategoryForm({ name: "", description: "", image_url: "" });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add category");
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      is_available: product.is_available
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2e1a]/95 backdrop-blur-lg border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/admin")}>
              <img src={Logo} alt="Shawarmore Logo" className="w-12 h-12 object-contain"/>
              <div>
                <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Dubai Shawarmore
                </h1>
                <p className="text-xs text-orange-300 tracking-widest">MANAGE PRODUCTS</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={() => navigate("/admin")}
                data-testid="nav-dashboard-btn"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={logout}
                data-testid="nav-logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Products Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Manage Products
            </h1>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowAddCategory(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full"
                data-testid="add-category-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Category
              </Button>
              <Button
                onClick={() => {
                  setShowAddProduct(true);
                  setEditingProduct(null);
                  setProductForm({ name: "", description: "", price: "", image_url: "", category_id: "", is_available: true });
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full"
                data-testid="add-product-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-green-200 text-xl">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl overflow-hidden"
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="relative h-48">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.is_available ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
                      }`}>
                        {product.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-green-300 text-sm line-clamp-2">{product.description}</p>
                    </div>
                    <p className="text-orange-400 font-bold text-xl">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditProduct(product)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        data-testid={`edit-product-${product.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        data-testid={`delete-product-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showAddProduct || editingProduct !== null} onOpenChange={(open) => {
        if (!open) {
          setShowAddProduct(false);
          setEditingProduct(null);
          setProductForm({ name: "", description: "", price: "", image_url: "", category_id: "", is_available: true });
        }
      }}>
        <DialogContent className="bg-[#1a2e1a] border-green-700 text-white max-w-2xl" data-testid="product-form-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl text-orange-500">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
            <div>
              <Label htmlFor="product-name" className="text-green-100">Product Name</Label>
              <Input
                id="product-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                required
                data-testid="product-name-input"
              />
            </div>
            <div>
              <Label htmlFor="product-description" className="text-green-100">Description</Label>
              <Input
                id="product-description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                data-testid="product-description-input"
              />
            </div>
            <div>
              <Label htmlFor="product-price" className="text-green-100">Price ($)</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                required
                data-testid="product-price-input"
              />
            </div>
            <div>
              <Label htmlFor="product-image" className="text-green-100">Image URL</Label>
              <Input
                id="product-image"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                placeholder="https://example.com/image.jpg"
                data-testid="product-image-input"
              />
            </div>
            <div>
              <Label htmlFor="product-category" className="text-green-100">Category</Label>
              <Select value={productForm.category_id} onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}>
                <SelectTrigger className="bg-green-900/20 border-green-700 text-white" data-testid="product-category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2e1a] border-green-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-white">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="product-available"
                checked={productForm.is_available}
                onCheckedChange={(checked) => setProductForm({ ...productForm, is_available: checked })}
                data-testid="product-available-switch"
              />
              <Label htmlFor="product-available" className="text-green-100">Available</Label>
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" data-testid="product-submit-btn">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="bg-[#1a2e1a] border-green-700 text-white" data-testid="category-form-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl text-orange-500">Add New Category</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label htmlFor="category-name" className="text-green-100">Category Name</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                required
                data-testid="category-name-input"
              />
            </div>
            <div>
              <Label htmlFor="category-description" className="text-green-100">Description</Label>
              <Input
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                data-testid="category-description-input"
              />
            </div>
            <div>
              <Label htmlFor="category-image" className="text-green-100">Image URL</Label>
              <Input
                id="category-image"
                value={categoryForm.image_url}
                onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                className="bg-green-900/20 border-green-700 text-white"
                placeholder="https://example.com/image.jpg"
                data-testid="category-image-input"
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" data-testid="category-submit-btn">
              Add Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;