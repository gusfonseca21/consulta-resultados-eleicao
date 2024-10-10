// --------->>>>>>> SELECIONDO OPÇÕES <<<<<------------
const painelEl = document.querySelector(".painel");
const seletorCandidaturaEl = document.querySelector(".seletor-candidatura");
const seletorEstadoEl = document.querySelector(".seletor-estado");
const seletorMunicipioEl = document.querySelector(".seletor-municipio");
const botaoCarregarEl = document.querySelector(".carregar");
const tituloColVice = document.querySelector(".vice-linha");
const tabelaEl = document.querySelector(".tabela");

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
  try {
    // Limpa tabela para mostrar os novos dados selecionados
    limparTabela();

    mostrarCarregando();

    const endpointFinal = ENDPOINT_BASE.replace("{ESTADO}", estadoSelecionado)
      .replace("{ESTADO_COD_MU}", estadoSelecionado + municipioSelecionado)
      .replace("{TIPO_CANDIDATURA}", candidaturaSelecionada);

    // c0011 = prefeito; c0013 = vereador
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
          const eleito = candidato.e === "s";

          const linha = [
            nome_candidato,
            sigla_partido,
            candidato.dvt,
            candidato.st,
            candidato.vap,
            candidato.pvap + "%",
          ];

          // Se for prefeito, adicionar nome do vice
          if (candidaturaSelecionada === "c0011") {
            const nome_vice = formatarNome(candidato.vs[0].nmu);
            linha.push(nome_vice);
          }

          const linhaTabelaEl = document.createElement("tr");

          const dadosLinhaEl = linha.map((dadoColuna, index) => {
            const colunaEl = document.createElement("td");
            if (index === 0 || index === 1) {
              colunaEl.className = "nome-partido";
            }
            if (index === 2) {
              colunaEl.className = "validade";
            }
            if (index === 3 || index === 4 || index === 5) {
              colunaEl.className = "situacao-numero-porcentagem";
              if (index === 3 && eleito) {
                colunaEl.className = "situacao-numero-porcentagem eleito";
              }
              // if (index === 3 && !eleito) {
              //   colunaEl.classList = "situacao-numero-porcentagem nao-eleito";
              // }
            }
            if (index === 6) {
              colunaEl.className = "vice";
            }
            colunaEl.textContent = dadoColuna;
            return colunaEl;
          });

          dadosLinhaEl.forEach((linhaEl) => {
            linhaTabelaEl.appendChild(linhaEl);
          });

          tabelaEl.appendChild(linhaTabelaEl);
        });
      });
    }
    const linhasOrdenadas = ordernarTabela(tabelaEl.children);

    limparTabela();

    linhasOrdenadas.forEach((linha) => {
      tabelaEl.appendChild(linha);
    });

    removerCarregando();

    console.log("Está chegando aqui?");
    tabelaEl.style.display = "table";
  } catch (error) {
    removerCarregando();
    console.error("Erro ao fazer requisição dos dados: ", error);
    mostrarErro();
  }
});

function formatarNome(nome) {
  return nome
    .replaceAll(",", "")
    .replace(";", "")
    .replace("&#186", "")
    .replaceAll("&#09", "");
}

function limparTabela() {
  tabelaEl.style.display = "none";

  // Lembrando que .forEach() não funciona com coleções de elementos HTML
  const linhasEl = tabelaEl.children;
  for (let i = linhasEl.length - 1; i > 0; i--) {
    linhasEl[i].remove();
  }

  const erroElemento = document.querySelector(".erro");
  if (erroElemento) {
    erroElemento.remove();
  }
}

function ordernarTabela(elementosLinhas) {
  const linhasArray = Array.from(elementosLinhas);

  // Remove o cabeçalho da tabela
  linhasArray.shift();

  linhasArray.sort((a, b) => {
    const totalVotosA = Number(a.children[4].innerText);
    const totalVotosB = Number(b.children[4].innerText);

    return totalVotosB - totalVotosA;
  });

  // Formata os valores de votos com toLocaleString para exibição
  linhasArray.forEach((linha) => {
    const votosCell = linha.children[4];
    const votosNumericos = Number(votosCell.innerText.replace(/\./g, "")); // Remove pontos de milhares
    votosCell.textContent = votosNumericos.toLocaleString("pt-BR"); // Formata para o padrão brasileiro
  });

  return linhasArray;
}

function mostrarCarregando() {
  const carregandoElemento = document.querySelector(".carregando");

  if (carregandoElemento) {
    carregandoElemento.remove();
  }

  const elementoDiv = document.createElement("div");
  elementoDiv.className = "carregando";
  elementoDiv.innerText = "Carregando...";
  painelEl.appendChild(elementoDiv);
}

function removerCarregando() {
  const carregandoElemento = document.querySelector(".carregando");

  if (carregandoElemento) {
    carregandoElemento.remove();
  }
}

function mostrarErro() {
  const erroElemento = document.querySelector(".erro");

  if (erroElemento) {
    erroElemento.remove();
  }
  const elementoDiv = document.createElement("div");
  elementoDiv.className = "erro";
  elementoDiv.innerText =
    "Erro ao retornar dados da votação. Por favor tente novamente mais tarde.";
  painelEl.appendChild(elementoDiv);
}
