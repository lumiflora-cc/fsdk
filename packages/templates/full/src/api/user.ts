/**
 * 用户 API 模块
 */

import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, ListParams } from '@/types'

// ============ 类型定义 ============

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  avatar?: string
}

// ============ API 方法 ============

/**
 * 获取用户详情
 * GET /users/:id
 */
export function getUserInfo(id: number): Promise<ApiResponse<User>> {
  return get<User>(`/users/${id}`)
}

/**
 * 获取用户列表
 * GET /users
 */
export function getUserList(params: ListParams): Promise<ApiResponse<User[]>> {
  return get<User[]>('/users', params)
}

/**
 * 创建用户
 * POST /users
 */
export function createUser(data: CreateUserDTO): Promise<ApiResponse<User>> {
  return post<User, CreateUserDTO>('/users', data)
}

/**
 * 更新用户
 * PUT /users/:id
 */
export function updateUser(id: number, data: UpdateUserDTO): Promise<ApiResponse<User>> {
  return put<User, UpdateUserDTO>(`/users/${id}`, data)
}

/**
 * 删除用户
 * DELETE /users/:id
 */
export function deleteUser(id: number): Promise<ApiResponse<void>> {
  return del<void>(`/users/${id}`)
}
