import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TableCategory {
    category_id: number;
    category_name: string;
    description: string;
    min_capacity: number;
    max_capacity: number;
    reservation_duration: number;
    price_category: string;
    is_active: boolean;
}

export default function TableCategories() {
    const [categories, setCategories] = useState<TableCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TableCategory | null>(null);
    const params = useParams();

    const [categoryForm, setCategoryForm] = useState({
        category_name: '',
        description: '',
        min_capacity: 0,
        max_capacity: 0,
        reservation_duration: 120,
        price_category: ''
    });

    useEffect(() => {
        fetchCategories();
    }, [params.tenantId]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/franchisemanager/api/postgres/list-table-categories');
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.data);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Kategoriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        try {
            const response = await fetch('/franchisemanager/api/postgres/add-table-category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryForm),
            });

            const data = await response.json();
            
            if (data.success) {
                setShowAddModal(false);
                setCategoryForm({
                    category_name: '',
                    description: '',
                    min_capacity: 0,
                    max_capacity: 0,
                    reservation_duration: 120,
                    price_category: ''
                });
                fetchCategories();
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Kategori eklenirken bir hata oluştu');
        }
    };

    const handleEditCategory = async () => {
        if (!selectedCategory) return;

        try {
            const response = await fetch('/franchisemanager/api/postgres/update-table-category', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...categoryForm,
                    category_id: selectedCategory.category_id,
                    is_active: true
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setShowEditModal(false);
                setSelectedCategory(null);
                setCategoryForm({
                    category_name: '',
                    description: '',
                    min_capacity: 0,
                    max_capacity: 0,
                    reservation_duration: 120,
                    price_category: ''
                });
                fetchCategories();
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Kategori güncellenirken bir hata oluştu');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Masa Kategorileri</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Yeni Kategori Ekle
                </button>
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Yeni Kategori Ekle</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori Adı</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.category_name}
                                    onChange={(e) => setCategoryForm({...categoryForm, category_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Açıklama</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min. Kapasite</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={categoryForm.min_capacity}
                                        onChange={(e) => setCategoryForm({...categoryForm, min_capacity: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max. Kapasite</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={categoryForm.max_capacity}
                                        onChange={(e) => setCategoryForm({...categoryForm, max_capacity: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rezervasyon Süresi (dk)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.reservation_duration}
                                    onChange={(e) => setCategoryForm({...categoryForm, reservation_duration: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fiyat Kategorisi</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.price_category}
                                    onChange={(e) => setCategoryForm({...categoryForm, price_category: e.target.value})}
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="economy">Ekonomik</option>
                                    <option value="standard">Standart</option>
                                    <option value="premium">Premium</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded"
                                onClick={() => setShowAddModal(false)}
                            >
                                İptal
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleAddCategory}
                            >
                                Ekle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Kategori Düzenle</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori Adı</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.category_name}
                                    onChange={(e) => setCategoryForm({...categoryForm, category_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Açıklama</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min. Kapasite</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={categoryForm.min_capacity}
                                        onChange={(e) => setCategoryForm({...categoryForm, min_capacity: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max. Kapasite</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={categoryForm.max_capacity}
                                        onChange={(e) => setCategoryForm({...categoryForm, max_capacity: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rezervasyon Süresi (dk)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.reservation_duration}
                                    onChange={(e) => setCategoryForm({...categoryForm, reservation_duration: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fiyat Kategorisi</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={categoryForm.price_category}
                                    onChange={(e) => setCategoryForm({...categoryForm, price_category: e.target.value})}
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="economy">Ekonomik</option>
                                    <option value="standard">Standart</option>
                                    <option value="premium">Premium</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedCategory(null);
                                }}
                            >
                                İptal
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleEditCategory}
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kategori Adı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kapasite
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rezervasyon Süresi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fiyat Kategorisi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category.category_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {category.category_name}
                                        </div>
                                        {category.description && (
                                            <div className="text-sm text-gray-500">
                                                {category.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {category.min_capacity} - {category.max_capacity} Kişi
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {category.reservation_duration} dakika
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${category.price_category === 'economy' ? 'bg-gray-100 text-gray-800' :
                                              category.price_category === 'standard' ? 'bg-blue-100 text-blue-800' :
                                              category.price_category === 'premium' ? 'bg-purple-100 text-purple-800' :
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {category.price_category === 'economy' ? 'Ekonomik' :
                                             category.price_category === 'standard' ? 'Standart' :
                                             category.price_category === 'premium' ? 'Premium' : 'VIP'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900"
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setCategoryForm({
                                                    category_name: category.category_name,
                                                    description: category.description || '',
                                                    min_capacity: category.min_capacity,
                                                    max_capacity: category.max_capacity,
                                                    reservation_duration: category.reservation_duration,
                                                    price_category: category.price_category
                                                });
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Düzenle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
