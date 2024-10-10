// --------->>>>>>> SELECIONDO OPÇÕES <<<<<------------
const painelEl = document.querySelector(".painel");
const seletorCandidaturaEl = document.querySelector(".seletor-candidatura");
const seletorEstadoEl = document.querySelector(".seletor-estado");
const seletorMunicipioEl = document.querySelector(".seletor-municipio");
const botaoCarregarEl = document.querySelector(".carregar");
const tituloColVice = document.querySelector(".vice-linha");
const tabelaEl = document.querySelector(".tabela");
const tabelaCorpo = document.querySelector(".tabela tbody");

let candidaturaSelecionada = "";
let estadoSelecionado = "";
let municipioSelecionado = "";

seletorCandidaturaEl.addEventListener("change", (value) => {
  const valor = value.target.value;
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
  // eslint-disable-next-line no-undef
  axios.get("./municipios_brasileiros_tse.json").then((resposta) => {
    const arrayOpcoesMunicipios = resposta.data
      .map((municipio) => {
        if (municipio.uf.toLowerCase() === siglaEstadoSelecionado) {
          const opcaoMunicipioEl = document.createElement("option");
          let codigo_municipio = municipio.codigo_tse.toString();
          if (codigo_municipio.length < 5) {
            codigo_municipio = codigo_municipio.padStart(5, "0");
          }
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

botaoCarregarEl.addEventListener("click", async () => {
  const linhasEl = tabelaEl.children;
  limparTabela();
  console.log("linhasEl", linhasEl);
  const endpointFinal = ENDPOINT_BASE.replace("{ESTADO}", estadoSelecionado)
    .replace("{ESTADO_COD_MU}", estadoSelecionado + municipioSelecionado)
    .replace("{TIPO_CANDIDATURA}", candidaturaSelecionada);

  if (candidaturaSelecionada === "c0011") {
    tituloColVice.style.display = "table-cell";
  } else {
    tituloColVice.style.display = "none";
  }

  // eslint-disable-next-line no-undef
  const resultado = await axios.get(endpointFinal);

  const dados = resultado.data;

  // Agremiações são as junções de vários partidos. Contém um array com os partidos que fazem parte da agremiação, que contém um array com os candidados do partido
  const agremiacoes = dados?.carg[0]?.agr;

  for (const agr of agremiacoes) {
    agr.par.forEach((partido) => {
      const sigla_partido = partido.sg;
      partido.cand.forEach((candidato) => {
        const nome_candidato = formatarNome(candidato.nmu);

        const linha = [
          nome_candidato,
          sigla_partido,
          candidato.dvt,
          candidato.st,
          candidato.vap,
          candidato.pvap + " %",
        ];

        // Se for prefeito, adicionar nome do vice
        if (candidaturaSelecionada === "c0011") {
          const nome_vice = formatarNome(candidato.vs[0].nmu);
          linha.push(nome_vice);
        }

        const linhaTabelaEl = document.createElement("tr");

        const dadosLinhaEl = linha.map((dadoColuna) => {
          const colunaEl = document.createElement("td");
          colunaEl.textContent = dadoColuna;
          return colunaEl;
        });

        dadosLinhaEl.forEach((linhaEl) => {
          linhaTabelaEl.appendChild(linhaEl);
        });

        tabelaEl.appendChild(linhaTabelaEl);
        tabelaEl.style.display = "table";
      });
    });
  }
});

function formatarNome(nome) {
  return nome.replaceAll(",", "").replace(";", "").replace(/&#09;/g, "");
}

function limparTabela() {
  const linhasEl = tabelaEl.children;
  for (let i = linhasEl.length - 1; i > 0; i--) {
    console.log("linhasEl[i]", linhasEl[i].textContent);
    linhasEl[i].remove();
  }
}
