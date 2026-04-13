// HTTP request wrapper
import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token or other headers
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    return data
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export default request
