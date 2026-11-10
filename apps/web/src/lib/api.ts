import axios from 'axios';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://api.timorah.me/api/v1';
  }
  return 'http://localhost:3001/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if available (real tokens only, exclude demo sessions)
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('timora_auth_token') ||
    localStorage.getItem('timora_access_token');
  const url = config.url || '';

  // Intercept demo order delivery confirmation (e.g. ord-101) to eliminate 404 network log
  if (
    config.method?.toLowerCase() === 'patch' &&
    url.includes('/orders/') &&
    url.includes('/confirm-delivery') &&
    url.includes('/orders/ord-')
  ) {
    const orderId = url.split('/orders/')[1]?.split('/')[0] || 'ord-101';
    config.adapter = async () => ({
      data: {
        success: true,
        data: {
          order: {
            id: orderId,
            status: 'completed',
            buyer_confirmed: true,
            seller_confirmed: true,
            updated_at: new Date().toISOString(),
          },
          bothConfirmed: true,
          message: 'Order marked as completed! Both parties have confirmed delivery.',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  }

  // Intercept demo transit booking acceptance (e.g. tb-1)
  if (
    config.method?.toLowerCase() === 'patch' &&
    url.includes('/transport/bookings/') &&
    url.includes('/accept') &&
    url.includes('/bookings/tb-')
  ) {
    const bookingId = url.split('/bookings/')[1]?.split('/')[0] || 'tb-1';
    config.adapter = async () => ({
      data: {
        success: true,
        data: { id: bookingId, status: 'confirmed' },
        message: 'Transit consignment booking accepted.',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  }

  // Intercept demo enquiry status update (e.g. enq-1)
  if (
    config.method?.toLowerCase() === 'patch' &&
    url.includes('/enquiries/') &&
    url.includes('/status') &&
    url.includes('/enquiries/enq-')
  ) {
    const enquiryId = url.split('/enquiries/')[1]?.split('/')[0] || 'enq-1';
    config.adapter = async () => ({
      data: {
        success: true,
        data: { id: enquiryId, status: 'completed' },
        message: 'Enquiry status updated successfully.',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  }

  if (token && !token.startsWith('demo-') && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && token.startsWith('demo-')) {
    // In local demo session mode, mock protected background endpoints so they do not fail with 401
    const method = config.method?.toLowerCase();

    // 1. Listings creation & management in demo mode
    if (url.includes('/listings') && method === 'post' && !url.includes('/images')) {
      let body: any = {};
      try {
        body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
      } catch {}
      const id = `lst-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      config.adapter = async () => ({
        data: { success: true, data: { id, ...body } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
      return config;
    }

    // 2. Listing photo uploads in demo mode
    if ((url.includes('/photos') || url.includes('/images')) && (method === 'patch' || method === 'post')) {
      config.adapter = async () => ({
        data: { success: true, message: 'Photo uploaded successfully.' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
      return config;
    }

    // 3. Seller's own inventory listings in demo mode
    if (url.includes('/listings/seller/me') && method === 'get') {
      config.adapter = async () => {
        let pending: any[] = [];
        let approved: any[] = [];
        try {
          const rawPending = localStorage.getItem('timora_pending_listings');
          if (rawPending) pending = JSON.parse(rawPending);
          const rawApproved = localStorage.getItem('timora_approved_listings');
          if (rawApproved) approved = JSON.parse(rawApproved);
        } catch {}
        return {
          data: { success: true, data: [...pending, ...approved] },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };
      return config;
    }

    // 4. Admin pending timber listings in demo mode
    if (url.includes('/admin/listings') && method === 'get') {
      config.adapter = async () => {
        let pending: any[] = [];
        try {
          const rawPending = localStorage.getItem('timora_pending_listings');
          if (rawPending) pending = JSON.parse(rawPending);
        } catch {}
        return {
          data: {
            success: true,
            data: { listings: pending, total: pending.length },
            listings: pending,
            total: pending.length,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };
      return config;
    }

    // 5. Admin listing approval / rejection / deletion in demo mode
    if (url.includes('/admin/listings') && (method === 'patch' || method === 'post' || method === 'delete')) {
      config.adapter = async () => ({
        data: { success: true, message: 'Listing status updated successfully.' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
      return config;
    }

    // 6. Generic demo session mocks
    if (
      url.includes('/support/notifications') ||
      url.includes('/orders') ||
      url.includes('/admin/sellers/pending') ||
      url.includes('/auth/me') ||
      (url.includes('/listings') && method && ['delete', 'patch', 'put'].includes(method))
    ) {
      config.adapter = async () => ({
        data: { success: true, data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
  }
  return config;
});

// Refresh token concurrency management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthSession = () => {
  localStorage.removeItem('timora_auth_token');
  localStorage.removeItem('timora_auth_user');
  localStorage.removeItem('timora_access_token');
  localStorage.removeItem('timora_refresh_token');
  localStorage.removeItem('timora_user');
  localStorage.removeItem('timora_last_active');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('timora:auth:unauthorized'));
  }
};

// Response interceptor with transparent 401 refresh rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      const currentToken =
        localStorage.getItem('timora_auth_token') ||
        localStorage.getItem('timora_access_token');
      // Never clear demo session on 401
      if (currentToken && currentToken.startsWith('demo-')) {
        return Promise.reject(error);
      }

      const url = originalRequest.url || '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/send-otp') ||
        url.includes('/auth/register');

      // Do not attempt token refresh for authentication credentials endpoints
      if (isAuthEndpoint) {
        if (url.includes('/auth/refresh')) {
          clearAuthSession();
        }
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        clearAuthSession();
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('timora_refresh_token');
      if (!refreshToken || refreshToken.startsWith('demo-')) {
        clearAuthSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const data = refreshResponse.data?.data;
        if (data?.accessToken) {
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;

          localStorage.setItem('timora_auth_token', newAccessToken);
          localStorage.setItem('timora_access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('timora_refresh_token', newRefreshToken);
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh response did not contain new access token.');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
