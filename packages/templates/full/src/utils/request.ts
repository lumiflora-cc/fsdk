// HTTP request wrapper
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    // Add auth token or other headers
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const { data } = response
    return data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default request
