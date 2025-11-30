import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/dropdown-menu";
import { ShoppingCart, User, LogOut, Plus, LayoutDashboard, Search, UserCircle } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";

const Menu = () => {
  const navigate = useNavigate();
  const { user, cart, addToCart, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query and category
    let filtered = products;
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2e1a]/95 backdrop-blur-lg border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="text-5xl">🌯</div>
              <div>
                <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  SHAWARMORE
                </h1>
                <p className="text-xs text-orange-300 tracking-widest">PREMIUM FLAVOUR EVERY WRAP</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={() => navigate("/menu")}
                data-testid="nav-menu-btn"
              >
                Menu
              </Button>

              {user ? (
                <>
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                      onClick={() => navigate("/admin")}
                      data-testid="nav-admin-btn"
                    >
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  {user.role === "customer" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                          data-testid="user-profile-menu"
                        >
                          <UserCircle className="w-5 h-5 mr-2" />
                          {user.full_name}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1a2e1a] border-green-700">
                        <DropdownMenuItem
                          onClick={() => navigate("/profile")}
                          className="text-green-100 hover:bg-green-900/30 cursor-pointer"
                          data-testid="profile-menu-item"
                        >
                          <UserCircle className="w-4 h-4 mr-2" />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/my-orders")}
                          className="text-green-100 hover:bg-green-900/30 cursor-pointer"
                          data-testid="orders-menu-item"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          My Orders
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    variant="ghost"
                    className="text-green-100 hover:text-orange-400 hover:bg-green-900/30 relative"
                    onClick={() => navigate("/cart")}
                    data-testid="nav-cart-btn"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                    onClick={logout}
                    data-testid="nav-logout-btn"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-green-100 hover:text-orange-400 hover:bg-green-900/30 relative"
                    onClick={() => navigate("/cart")}
                    data-testid="nav-cart-btn"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
                    onClick={() => navigate("/")}
                    data-testid="nav-login-btn"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-bold text-center text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our Menu
          </h1>
          <p className="text-green-200 text-center text-lg mb-12 max-w-2xl mx-auto">
            Discover our premium selection of wraps and sides, crafted with the freshest ingredients
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for wraps, drinks, sides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-green-900/20 border-green-700 text-white placeholder:text-green-400 h-14 text-lg rounded-full"
                data-testid="search-input"
              />
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                onClick={() => handleCategoryChange(null)}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === null
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-green-900/30 hover:bg-green-900/50 text-green-100 border border-green-700"
                }`}
                data-testid="category-all-btn"
              >
                All Items
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`rounded-full px-6 py-2 ${
                    selectedCategory === category.id
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-green-900/30 hover:bg-green-900/50 text-green-100 border border-green-700"
                  }`}
                  data-testid={`category-${category.id}-btn`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="text-center text-green-200 text-xl">Loading menu...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-green-200 text-xl">
              {searchQuery ? `No products found for "${searchQuery}"` : "No products available"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all hover:scale-105 group"
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                    <p className="text-green-300 text-sm line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-orange-400 font-bold text-xl">${product.price.toFixed(2)}</span>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 p-0"
                        data-testid={`add-to-cart-${product.id}`}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;