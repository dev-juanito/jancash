class Conexion {
  urlApi = "http://localhost:3308/api/";

  async getData(url) {
    let response = await fetch(`${this.urlApi}${url}`);
    const data = await response.json();
    return data;
  }

  async postData(url, info) {
    let response = await fetch(`${this.urlApi}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    const data = await response.json();
    console.log('respuesta post', data);
    return data;
  }
}

export default Conexion;