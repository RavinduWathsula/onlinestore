import axios from 'axios';

const isViteDev = Boolean(import.meta.env.DEV);
const fallbackBaseUrl = isViteDev ? '/api' : '/NovaStore/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl,
  withCredentials: true,
});

export const authApi = {
  session: () => api.get('/session.php'),
  login: (payload) => api.post('/login.php', payload),
  register: (payload) => api.post('/register.php', payload),
  logout: () => api.post('/logout.php'),
};

export const productsApi = {
  list: (params) => api.get('/products.php', { params }),
  detail: (id) => api.get('/products.php', { params: { id } }),
  add: (payload) => api.post('/add_product.php', payload),
  update: (payload) => api.put('/products.php', payload),
  remove: (id) => api.delete('/products.php', { params: { id } }),
  categories: () => api.get('/categories.php'),
};

export const reviewsApi = {
  list: (productId) => api.get('/reviews.php', { params: { product_id: productId } }),
};

export const cartApi = {
  list: () => api.get('/cart.php'),
  add: (payload) => api.post('/cart.php', payload),
  update: (payload) => api.patch('/cart.php', payload),
  remove: (cartId) => api.delete('/cart.php', { params: { cart_id: cartId } }),
};

export const ordersApi = {
  list: () => api.get('/orders.php'),
  checkout: (payload) => api.post('/orders.php', payload),
  receipt: (orderId) => api.get('/receipt.php', { params: { order_id: orderId } }),
};

export const otpApi = {
  send: (phone) => api.post('/payment_otp.php', { action: 'send', phone }),
  verify: (payload) => api.post('/payment_otp.php', { action: 'verify', ...payload }),
};

export const adminApi = {
  stats: () => api.get('/admin_stats.php'),
  users: () => api.get('/users.php'),
};

export default api;
