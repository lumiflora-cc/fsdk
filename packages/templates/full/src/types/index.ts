// HTTP 请求/响应类型定义

import type { InternalAxiosRequestConfig } from 'axios'

// ============ 通用响应结构 ============

/** 基础 API 响应 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: number | string
}

/** 分页元数据 */
export interface PageMeta {
  total: number
  page: number
  pageSize: number
  totalPages?: number
}

/** 分页响应 */
export interface PaginatedResponse<T = unknown> {
  success: boolean
  data: T[]
  meta: PageMeta
  error?: string
}

/** 列表响应（不分页） */
export interface ListResponse<T = unknown> {
  success: boolean
  data: T[]
  total?: number
  error?: string
}

// ============ 请求配置 ============

/** 扩展的请求配置 */
export interface RequestConfigExtra {
  /** 是否显示全局 loading */
  loading?: boolean
  /** 是否自动处理错误提示 */
  showError?: boolean
  /** 请求重试次数 */
  retry?: number
  /** 请求重试延迟（ms） */
  retryDelay?: number
}

export type FullRequestConfig<T = unknown> = InternalAxiosRequestConfig<T> & RequestConfigExtra

// ============ 响应类型扩展 ============

/** 带元数据的响应（用于列表类接口） */
export interface ResponseWithMeta<T = unknown, M = PageMeta> {
  data: T
  meta: M
  status: number
  statusText: string
  headers: Record<string, string>
}

/** 错误响应结构 */
export interface ApiError {
  success: false
  error: string
  code?: number | string
  details?: Record<string, string[]>
}

// ============ 请求方法类型 ============

/** GET 请求参数 */
export interface GetRequestParams {
  [key: string]: string | number | boolean | undefined | null
}

/** POST/PUT/PATCH 请求体 */
export interface RequestData<T = unknown> {
  [key: string]: T
}

/** DELETE 请求参数 */
export interface DeleteRequestParams {
  [key: string]: string | number | boolean | undefined | null
}

// ============ 通用 API 方法签名 ============

/** 通用列表查询参数 */
export interface ListParams {
  page?: number
  pageSize?: number
  /** 搜索关键词 */
  keyword?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方向 asc | desc */
  orderDirection?: 'asc' | 'desc'
  [key: string]: string | number | boolean | undefined | null
}

/** 创建请求参数 */
export interface CreateParams<T = unknown> {
  data: T
}

/** 更新请求参数 */
export interface UpdateParams<T = unknown> {
  id: string | number
  data: Partial<T>
}

/** 删除请求参数 */
export interface DeleteParams {
  id: string | number
}

/** 批量删除请求参数 */
export interface BatchDeleteParams {
  ids: (string | number)[]
}
