/**
 * HTTP 请求封装
 * 基于 Axios 封装，提供统一的请求/响应处理、类型支持和常见请求方法
 */

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type AxiosRequestConfig
} from 'axios'
import type {
  ApiResponse,
  PaginatedResponse,
  ListResponse,
  FullRequestConfig,
  ListParams,
  GetRequestParams
} from '@/types'

// ============ 创建实例 ============

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: Number(import.meta.env.VITE_APP_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ============ 请求拦截器 ============

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存（GET 请求）
    if (config.method === 'get' && !config.params._t) {
      config.params = { ...config.params, _t: Date.now() }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// ============ 响应拦截器 ============

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    // 如果后端返回的是标准 ApiResponse 结构，直接返回 data
    if (data && typeof data === 'object' && 'success' in data) {
      return data
    }

    // 否则包装成标准格式
    return {
      success: true,
      data,
      message: response.statusText
    } as ApiResponse
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as FullRequestConfig

    // 处理 401 未授权
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    // 重试逻辑
    if (originalRequest.retry && originalRequest.retry > 0) {
      originalRequest.retry--
      const delay = originalRequest.retryDelay || 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      return request(originalRequest)
    }

    // 统一错误处理
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      '网络请求失败'

    return Promise.reject({
      success: false,
      error: errorMessage,
      code: error.response?.status,
      details: (error.response?.data as Record<string, string[]>) || {}
    })
  }
)

// ============ 便捷请求方法 ============

/**
 * GET 请求
 */
export function get<T = unknown>(
  url: string,
  params?: GetRequestParams,
  config?: FullRequestConfig
): Promise<ApiResponse<T>> {
  return request.get(url, { params, ...config })
}

/**
 * POST 请求
 */
export function post<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: FullRequestConfig
): Promise<ApiResponse<T>> {
  return request.post(url, data, config)
}

/**
 * PUT 请求
 */
export function put<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: FullRequestConfig
): Promise<ApiResponse<T>> {
  return request.put(url, data, config)
}

/**
 * PATCH 请求
 */
export function patch<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: FullRequestConfig
): Promise<ApiResponse<T>> {
  return request.patch(url, data, config)
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(
  url: string,
  params?: GetRequestParams,
  config?: FullRequestConfig
): Promise<ApiResponse<T>> {
  return request.delete(url, { params, ...config })
}

// ============ 分页请求方法 ============

/**
 * 分页列表请求
 */
export function paginate<T = unknown>(
  url: string,
  params?: ListParams,
  config?: FullRequestConfig
): Promise<PaginatedResponse<T>> {
  const { page = 1, pageSize = 10, ...rest } = params || {}
  return request.get(url, {
    params: { page, pageSize, ...rest },
    ...config
  })
}

/**
 * 不分页的列表请求
 */
export function list<T = unknown>(
  url: string,
  params?: GetRequestParams,
  config?: FullRequestConfig
): Promise<ListResponse<T>> {
  return request.get(url, { params, ...config })
}

// ============ 工具方法 ============

/**
 * 下载文件
 */
export function download(
  url: string,
  params?: GetRequestParams,
  filename?: string
): void {
  request
    .get(url, { params, responseType: 'blob' })
    .then((response: AxiosResponse) => {
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename || 'download'
      link.click()
      URL.revokeObjectURL(link.href)
    })
}

/**
 * 上传文件
 */
export function upload<T = unknown>(
  url: string,
  file: File | Blob,
  data?: Record<string, string>,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const formData = new FormData()
  formData.append('file', file)
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }

  return request.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  })
}

// ============ 导出 ============

export { request }
export default request
