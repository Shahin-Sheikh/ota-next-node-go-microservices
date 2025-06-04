// utils/api-client.utils.js
const axios = require("axios");

class ApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
      },
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error(`HTTP Error [${error.config?.url}]:`, error.message);
        throw error;
      }
    );
  }

  async get(path, params) {
    return this.client.get(path, { params });
  }

  async post(path, data) {
    return this.client.post(path, data);
  }
}

module.exports = ApiClient;
