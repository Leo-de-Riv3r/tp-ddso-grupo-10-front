import axios from "axios";

const baseUrl =  `${process.env.REACT_APP_API_BASE_URL}/auth`

const register = async(user) => {
  const response = await axios.post(baseUrl + '/register', user)
  return response.data
}

const login = async(credentials) => {
  const response = await axios.post(baseUrl + '/login', credentials)
  return response.data
}

const logout = async() => {
  await axios.post(baseUrl + '/logout')
}

const refresh = async () => {
  const response = await axios.post(baseUrl + '/refresh')
  return response.data
}

export default {register, login, logout, refresh}