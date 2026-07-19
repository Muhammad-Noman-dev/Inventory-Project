import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { Boxes, Package, AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductInventory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategorySummary();
    }, []);

    const fetchCategorySummary = async () => {
        try {
            const res = await API.get("/product/category-summary");
            setCategories(res.data.categories || []);
        } catch (error) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500">
                Loading inventory...
            </div>
        );
    }
    const fetchProductsByCategory = async (category) => {
        try {
            setLoadingProducts(true);

            const res = await API.get(
                `/product/category/${category._id}`
            );

            setProducts(res.data.products || []);
            setSelectedCategory(category);

        } catch (err) {
            toast.error("Failed to load products");
        } finally {
            setLoadingProducts(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Product Inventory</h1>
                <p className="text-gray-500 mt-2">
                    Category-wise inventory overview
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {categories.map((cat) => (

                    <div
                        key={cat._id}
                        onClick={() =>
                            navigate(`/product-inventory/${cat._id}`)
                        }
                        className={`
    bg-white
    rounded-3xl
    border-2
    shadow-sm
    p-6
    cursor-pointer
    transition-all
    hover:shadow-lg

    ${selectedCategory?._id === cat._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }
  `}
                    >


                        <div className="flex justify-between items-start">

                            <div>
                                <h2 className="text-xl font-bold">
                                    {cat.categoryName}
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    {cat.totalProducts} Products
                                </p>
                            </div>

                            <div className="bg-blue-100 p-3 rounded-2xl">
                                <Boxes className="text-blue-600" size={24} />
                            </div>

                        </div>


                        <div className="mt-6 space-y-3">

                            <div className="flex justify-between">
                                <span>Total Stock</span>
                                <span className="font-semibold">
                                    {cat.totalStock}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Cost Value</span>
                                <span className="font-semibold">
                                    Rs. {cat.costValue.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Sale Value</span>
                                <span className="font-semibold text-green-600">
                                    Rs. {cat.saleValue.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Expected Profit</span>
                                <span className="font-semibold text-blue-600">
                                    Rs. {cat.expectedProfit.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-orange-600">
                                <span className="flex items-center gap-2">
                                    <AlertTriangle size={18} />
                                    Low Stock
                                </span>

                                <span className="font-semibold">
                                    {cat.lowStock}
                                </span>
                            </div>

                            <div className="flex justify-between text-red-600">
                                <span className="flex items-center gap-2">
                                    <XCircle size={18} />
                                    Out of Stock
                                </span>

                                <span className="font-semibold">
                                    {cat.outOfStock}
                                </span>
                            </div>

                        </div>

                    </div>

                ))}

            </div>
            {selectedCategory && (
                <div className="mt-10">
                    <h2 className="text-2xl font-bold">
                        {selectedCategory.categoryName}
                    </h2>
                </div>
            )}
            {selectedCategory && (
                <div className="mt-10 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

                    <div className="flex justify-between items-center p-6 border-b">
                        <div>
                            <h2 className="text-2xl font-bold">
                                {selectedCategory.categoryName}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {products.length} Products
                            </p>
                        </div>
                    </div>

                    {loadingProducts ? (
                        <div className="p-8 text-center">
                            Loading Products...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No products found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="px-6 py-4 text-left">Product</th>

                                        <th className="px-6 py-4 text-left">SKU</th>

                                        <th className="px-6 py-4 text-center">Stock</th>

                                        <th className="px-6 py-4 text-center">Cost</th>

                                        <th className="px-6 py-4 text-center">Sale</th>

                                        <th className="px-6 py-4 text-center">Status</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {products.map((product) => (

                                        <tr
                                            key={product._id}
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4 font-medium">
                                                {product.name}
                                            </td>

                                            <td className="px-6 py-4">
                                                {product.sku}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {product.stock}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                Rs. {product.costPrice.toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4 text-center text-green-600 font-semibold">
                                                Rs. {product.sellingPrice.toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4 text-center">

                                                {product.stock === 0 ? (

                                                    <span className="text-red-600 font-semibold">
                                                        Out of Stock
                                                    </span>

                                                ) : product.stock <= product.minStock ? (

                                                    <span className="text-orange-600 font-semibold">
                                                        Low Stock
                                                    </span>

                                                ) : (

                                                    <span className="text-green-600 font-semibold">
                                                        In Stock
                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default ProductInventory;