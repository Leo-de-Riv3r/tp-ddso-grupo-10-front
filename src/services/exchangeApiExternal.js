const baseUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

export const obtenerTipoCambio = () => {
  const tiposCambio = {};

  try {
    const [dataArs, dataUsd, dataBrl] = Promise.all([
      fetch(baseUrl + "/ars.json").then(res => res.json()),
      fetch(baseUrl + "/usd.json").then(res_1 => res_1.json()),
      fetch(baseUrl + "/brl.json").then(res_2 => res_2.json())
    ]);
    const cambiosArs = dataArs["ars"];
    const cambiosUsd = dataUsd["usd"];
    const cambiosBrl = dataBrl["brl"];

    tiposCambio["PESO_ARG"] = {
      DOLAR_USA: cambiosArs["usd"],
      REAL: cambiosArs["brl"],
      PESO_ARG: 1,
    };
    tiposCambio["DOLAR_USA"] = {
      PESO_ARG: cambiosUsd["ars"],
      REAL: cambiosUsd["brl"],
      DOLAR_USA: 1,
    };
    tiposCambio["REAL"] = {
      PESO_ARG: cambiosBrl["ars"],
      DOLAR_USA: cambiosBrl["usd"],
      REAL: 1,
    };
    return tiposCambio;
  } catch (error) {
    return null;
  } // si falla, retorna null
};
