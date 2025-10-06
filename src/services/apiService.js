const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
};

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },
};

// Categories API
export const categoriesAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        return handleResponse(response);
    },
};

// Food Items API
export const foodItemsAPI = {
    getAll: async (categoryId = null) => {
        const url = categoryId 
            ? `${API_BASE_URL}/food-items?category_id=${categoryId}`
            : `${API_BASE_URL}/food-items`;
        
        const response = await fetch(url);
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/food-items/${id}`);
        return handleResponse(response);
    },
};

// Cart API
export const cartAPI = {
    getCart: async () => {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
                ...getAuthHeaders(),
            },
        });
        return handleResponse(response);
    },

    addItem: async (foodItemId, quantity = 1) => {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                food_item_id: foodItemId,
                quantity,
            }),
        });
        return handleResponse(response);
    },

    updateItem: async (foodItemId, quantity) => {
        const response = await fetch(`${API_BASE_URL}/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                food_item_id: foodItemId,
                quantity,
            }),
        });
        return handleResponse(response);
    },

    clearCart: async () => {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
            },
        });
        return handleResponse(response);
    },
};

// Addresses API
export const addressesAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            headers: {
                ...getAuthHeaders(),
            },
        });
        return handleResponse(response);
    },

    add: async (addressData) => {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(addressData),
        });
        return handleResponse(response);
    },
};

// Orders API
export const ordersAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: {
                ...getAuthHeaders(),
            },
        });
        return handleResponse(response);
    },

    create: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(orderData),
        });
        return handleResponse(response);
    },
};

// Profile API
export const profileAPI = {
    get: async () => {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                ...getAuthHeaders(),
            },
        });
        return handleResponse(response);
    },

    update: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(profileData),
        });
        return handleResponse(response);
    },
};

// Admin API
export const adminAPI = {
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { ...getAuthHeaders() }
        });
        return handleResponse(response);
    },

    // Food Items Management
    getFoodItems: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/food-items`, {
            headers: { ...getAuthHeaders() }
        });
        return handleResponse(response);
    },

    createFoodItem: async (foodData) => {
        const response = await fetch(`${API_BASE_URL}/admin/food-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(foodData)
        });
        return handleResponse(response);
    },

    updateFoodItem: async (id, updates) => {
        const response = await fetch(`${API_BASE_URL}/admin/food-items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },

    deleteFoodItem: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/food-items/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeaders() }
        });
        return handleResponse(response);
    },

    // Orders Management
    getOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/orders`, {
            headers: { ...getAuthHeaders() }
        });
        return handleResponse(response);
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    },

    // Users Management
    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { ...getAuthHeaders() }
        });
        return handleResponse(response);
    },

    // Categories Management
    createCategory: async (name) => {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ name })
        });
        return handleResponse(response);
    }
};

// Health check
export const healthAPI = {
    check: async () => {
        const response = await fetch(`${API_BASE_URL}/health`);
        return handleResponse(response);
    },
};