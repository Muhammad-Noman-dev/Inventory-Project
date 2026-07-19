import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import API from "../api";

const CategoryProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { categoryId } = useParams();
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/product/category/${categoryId}`);

            setProducts(res.data.products || []);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };
    const totalStock = products.reduce(
        (sum, product) => sum + product.stock,
        0
    );

    const costValue = products.reduce(
        (sum, product) => sum + product.stock * product.costPrice,
        0
    );

    const saleValue = products.reduce(
        (sum, product) => sum + product.stock * product.sellingPrice,
        0
    );

    const expectedProfit = saleValue - costValue;

    const lowStock = products.filter(
        (product) => product.stock > 0 && product.stock <= product.minStock
    ).length;

    const outOfStock = products.filter(
        (product) => product.stock === 0
    ).length;

    return (
        <div className="max-w-7xl mx-auto">

            <button
                onClick={() => navigate("/product-inventory")}
                className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
                <ArrowLeft size={18} />
                Back to Product Inventory
            </button>

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    {products[0]?.category?.name} Inventory
                </h1>

                <p className="text-gray-500 mt-2">
                    Complete inventory details
                </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

                <div className="bg-white rounded-3xl shadow-sm border p-6">
                    <p className="text-gray-500">Total Products</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {products.length}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border p-6">
                    <p className="text-gray-500">Total Stock</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {totalStock}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border p-6">
                    <p className="text-gray-500">Cost Value</p>
                    <h2 className="text-3xl font-bold mt-2">
                        Rs. {costValue.toLocaleString()}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border p-6">
                    <p className="text-gray-500">Sale Value</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-2">
                        Rs. {saleValue.toLocaleString()}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border p-6">
                    <p className="text-gray-500">Expected Profit</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-2">
                        Rs. {expectedProfit.toLocaleString()}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border p-6">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-orange-600">
                                Low Stock
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                {lowStock}
                            </h2>

                        </div>

                        <div>

                            <p className="text-red-600">
                                Out Of Stock
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                {outOfStock}
                            </h2>

                        </div>

                    </div>

                </div>
             
            </div>
               <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">
                            Products List
                        </h2>
                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>
                                    <th className="px-6 py-4 text-left">Product</th>
                                    <th className="px-6 py-4 text-left">SKU</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4 text-center">Cost Price</th>
                                    <th className="px-6 py-4 text-center">Selling Price</th>
                                    <th className="px-6 py-4 text-center">Profit</th>
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

                                        <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                                            Rs. {(product.sellingPrice - product.costPrice).toLocaleString()}
                                        </td>

                                        <td className="px-6 py-4 text-center">

                                            {product.stock === 0 ? (

                                                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                                                    Out Of Stock
                                                </span>

                                            ) : product.stock <= product.minStock ? (

                                                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                                                    Low Stock
                                                </span>

                                            ) : (

                                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium">
                                                    In Stock
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

        </div>
    );
};

export default CategoryProducts;