// --------->>>>>>> SELECIONDO OPÇÕES <<<<<------------
const painelEl = document.querySelector(".painel");
const seletorCandidaturaEl = document.querySelector(".seletor-candidatura");
const seletorEstadoEl = document.querySelector(".seletor-estado");
const seletorMunicipioEl = document.querySelector(".seletor-municipio");
const botaoCarregarEl = document.querySelector(".carregar");

let candidaturaSelecionada = "";
let estadoSelecionado = "";
let municipioSelecionado = "";

seletorCandidaturaEl.addEventListener("change", (value) => {
  const valor = value.target.value;
  console.log("valor", valor);
  if (!valor) {
    seletorEstadoEl.disabled = true;
    seletorMunicipioEl.disabled = true;
    botaoCarregarEl.disabled = true;
    limparOpcoes(seletorMunicipioEl);
    candidaturaSelecionada = "";
    seletorEstadoEl.value = "";
  } else {
    seletorEstadoEl.disabled = false;
    candidaturaSelecionada = valor;
  }
});

seletorEstadoEl.addEventListener("change", (value) => {
  limparOpcoes(seletorMunicipioEl);
  const valor = value.target.value;
  if (!valor) {
    seletorMunicipioEl.disabled = true;
    botaoCarregarEl.disabled = true;
    estadoSelecionado = "";
  } else {
    seletorMunicipioEl.disabled = false;
    estadoSelecionado = valor;
    retornaMunicipios(valor);
  }
});

seletorMunicipioEl.addEventListener("change", (value) => {
  const valor = value.target.value;
  if (!valor) {
    botaoCarregarEl.disabled = true;
    municipioSelecionado = "";
  } else {
    botaoCarregarEl.disabled = false;
    municipioSelecionado = valor;
  }
});

function retornaMunicipios(siglaEstadoSelecionado) {
  // Importando array com nome dos municípios e seu código do TSE
  axios.get("./municipios_brasileiros_tse.json").then((resposta) => {
    const arrayOpcoesMunicipios = resposta.data
      .map((municipio) => {
        if (municipio.uf.toLowerCase() === siglaEstadoSelecionado) {
          const opcaoMunicipioEl = document.createElement("option");
          let codigo_municipio = municipio.codigo_tse.toString();
          if (codigo_municipio.length < 5) {
            codigo_municipio = codigo_municipio.padStart(5, "0");
          }
          console.log("codigo_municipio", codigo_municipio);
          opcaoMunicipioEl.value = codigo_municipio;
          opcaoMunicipioEl.textContent = municipio.nome_municipio;
          return opcaoMunicipioEl;
        }
      })
      .filter((opcaoMunicipioEl) => opcaoMunicipioEl);
    arrayOpcoesMunicipios.forEach((opcao) => {
      seletorMunicipioEl.appendChild(opcao);
    });
  });
}

function limparOpcoes(elementoASerLimpo) {
  const opcoes = elementoASerLimpo.options;
  // Remove todas as opções menos a primeira, que é a padrão
  for (let i = opcoes.length - 1; i > 0; i--) {
    elementoASerLimpo.remove(i);
  }
}

// ------->>>>> CARREGANDO E MOSTRANDO DADOS NA TABELA <<<<<------
const ENDPOINT_BASE =
  "https://resultados.tse.jus.br/oficial/ele2024/619/dados/{ESTADO}/{ESTADO_COD_MU}-{TIPO_CANDIDATURA}-e000619-u.json";

botaoCarregarEl.addEventListener("click", () => {
  const endpointFinal = ENDPOINT_BASE.replace("{ESTADO}", estadoSelecionado)
    .replace("{ESTADO_COD_MU}", estadoSelecionado + municipioSelecionado)
    .replace("{TIPO_CANDIDATURA}", candidaturaSelecionada);

  const dados = axios.get(endpointFinal).then((resultado) => resultado.data);

  // Agremiações são as junções de vários partidos. Contém um array com os partidos que fazem parte da agremiação, que contém um array com os candidados do partido
  const agremiacoes = dados?.carg[0]?.agr;

  for (const agr of agremiacoes) {
    agr.par.forEach((partido) => {
      const sigla_partido = partido.sg;
      partido.cand.forEach((candidato) => {
        let nome_candidato = candidato.nmu
          .replaceAll(",", "")
          .replace(";", "")
          .replace(/&#09;/g, "");
        // nome_candidato = he.decode(nome_candidato);

        const linha_tabela = [
          nome_candidato,
          sigla_partido,
          candidato.n,
          nome_municipio,
          sigla_estado.toUpperCase(),
          candidato.dt,
          candidato.dvt,
          candidato.st,
          candidato.vap,
          candidato.pvap,
        ];

        if (values.candidatura === "prefeito") {
          const nome_vice = he.decode(candidato.vs[0].nmu.replace(",", ""));
          linha_tabela.push(nome_vice);
        }

        tabela.push(linha_tabela);
      });
    });
  }
});
