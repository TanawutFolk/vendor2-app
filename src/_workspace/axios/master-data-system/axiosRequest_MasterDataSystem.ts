import axios from 'axios'

const axiosInstance = (() => {
  return axios.create({
    baseURL: `${import.meta.env.VITE_MASTER_DATA_SYSTEM_API_URL}`,
    //timeout: 120000, // ตั้งค่า timeout ที่ 120 วินาที (2 นาที)
    // VITE_SECURITY_CENTER_SYSTEM_API_URL
    //timeout: 500000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
})()

async function axiosRequest_MasterDataSystem(options: any) {
  const onSuccess = function (response: any) {
    return response
  }

  const onError = function (error: any) {
    return Promise.reject(error)
  }

  return axiosInstance(options).then(onSuccess).catch(onError)
}

export default axiosRequest_MasterDataSystem
