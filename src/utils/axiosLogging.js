const axios = require("axios");

function setUpAxiosInterceptios() {
  axios.interceptors.request.use((x) => {
    const headers = {
      ...x.headers.common,
      ...x.headers[x.method],
      ...x.headers,
    };

    ["common", "get", "post", "head", "put", "patch", "delete"].forEach(
      (header) => {
        delete headers[header];
      }
    );

    const printable = `${new Date()} | Request: ${x.method.toUpperCase()} | ${
      x.url
    } | ${JSON.stringify(x.data)} | ${JSON.stringify(headers)}`;
    console.log(printable + "\n");

    return x;
  });

  axios.interceptors.response.use((x) => {
    const printable = `${new Date()} | Response: ${x.status} | ${JSON.stringify(
      x.data
    )}`;
    console.log(printable + "\n");

    return x;
  });
}

module.exports = setUpAxiosInterceptios;
