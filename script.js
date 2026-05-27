const form = document.querySelector("#cep-form");
const input = document.querySelector("#cep");
const statusText = document.querySelector("#status");
const result = document.querySelector("#result");
const button = form.querySelector("button");

const fields = {
  title: document.querySelector("#result-title"),
  street: document.querySelector("#street"),
  district: document.querySelector("#district"),
  city: document.querySelector("#city"),
  state: document.querySelector("#state"),
  ddd: document.querySelector("#ddd"),
  postalCode: document.querySelector("#postal-code"),
};

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function formatCep(value) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return digits;
}

function setStatus(message, type = "info") {
  statusText.textContent = message;
  statusText.classList.toggle("error", type === "error");
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.querySelector("span").textContent = isLoading ? "Buscando..." : "Buscar";
}

function showResult(data) {
  const street = data.logradouro || "Nao informado";
  const district = data.bairro || "Nao informado";
  const city = data.localidade || "Nao informado";
  const state = data.uf || "Nao informado";
  const ddd = data.ddd || "Nao informado";

  fields.title.textContent = `${city} - ${state}`;
  fields.street.textContent = street;
  fields.district.textContent = district;
  fields.city.textContent = city;
  fields.state.textContent = state;
  fields.ddd.textContent = ddd;
  fields.postalCode.textContent = data.cep || input.value;

  result.hidden = false;
}

input.addEventListener("input", () => {
  input.value = formatCep(input.value);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cep = onlyDigits(input.value);
  result.hidden = true;

  if (cep.length !== 8) {
    setStatus("Digite um CEP com 8 numeros.", "error");
    input.focus();
    return;
  }

  setLoading(true);
  setStatus("Consultando CEP...");

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
      throw new Error("Falha na consulta");
    }

    const data = await response.json();

    if (data.erro) {
      setStatus("CEP nao encontrado. Confira os numeros e tente novamente.", "error");
      return;
    }

    showResult(data);
    setStatus("Consulta realizada com sucesso.");
  } catch (error) {
    setStatus("Nao foi possivel consultar agora. Verifique sua conexao e tente novamente.", "error");
  } finally {
    setLoading(false);
  }
});
