// currently not working, must be considered for production use
const createDeeplink = (path, queryParams) => {
  const baseUrl = `https://expo.dev/--/to/`;

  let url = `${baseUrl}${path}`;
  if (queryParams) {
    const queryString = new URLSearchParams(queryParams).toString();
    url += `?${queryString}`;
  }

  return url;
};

module.exports = createDeeplink;