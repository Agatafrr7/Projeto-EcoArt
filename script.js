// Lista de Produtos
const produtos = [
    {
        id: 1,
        nome: "Cesto de Bambu",
        preco: 50.00,
        descricao: "Feito à mão com bambu 100% natural. Durabilidade e estilo para sua casa.",
        imagem: "images/cesto-bambu.jpg",
        categoria: "Organização"
    },
    {
        id: 2,
        nome: "Vela de Soja Aromatizada",
        preco: 25.00,
        descricao: "Vela ecológica com essência de lavanda. Queima limpa e sem toxinas.",
        imagem: "images/vela-soja.jpg",
        categoria: "Aromas"
    },
    {
        id: 3,
        nome: "Copo Sustentavel",
        preco: 30.00,
        descricao: "Copo térmico para bebidas quentes e frias. Acompanha canudo de bambu.",
        imagem: "images/copo-sustentavel.jpg",
        categoria: "Culinária"
    },
    {
        id: 4,
        nome: "Ecobag Plastico reciclado",
        preco: 40.00,
        descricao: "Sacola resistente para substituir plásticos. Estampa de artista local.",
        imagem: "images/ecobag-reciclavel.jpg",
        categoria: "Moda"
    },
    {
        id: 5,
        nome: "Sabonete Artesanal",
        preco: 15.00,
        descricao: "Sabonete natural sem químicos agressivos. Opções: alecrim, lavanda e citronela.",
        imagem: "images/sabonete.jpg",
        categoria: "Higiene"
    },
    {
        id: 6,
        nome: "Porta-Talheres de Madeira",
        preco: 35.00,
        descricao: "Kit completo com faca, garfo e colher para viagem. Embalagem de tecido.",
        imagem: "images/porta-talheres.jpg",
        categoria: "Culinária"
    }
];

// Carrega produtos do backend
async function carregarProdutos() {
  try {
    const response = await fetch('http://localhost:3000/api/produtos');
    const produtos = await response.json();
    
// Renderiza os produtos na página
    const container = document.getElementById('produtos-container');
    container.innerHTML = produtos.map(produto => `
      <div class="produto-card">
        <h3>${produto.nome}</h3>
        <p>R$ ${produto.preco.toFixed(2)}</p>
        <button onclick="adicionarAoCarrinho('${produto._id}')">Comprar</button>
      </div>
    `).join('');
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

// Chama a função quando a página carrega
window.onload = carregarProdutos;

// Carrinho de Compras
let carrinho = [];

// DOM Elements
const produtosContainer = document.getElementById('produtos-container');
const carrinhoContador = document.getElementById('carrinho-contador');

// Renderizar Produtos
function renderizarProdutos() {
    produtosContainer.innerHTML = '';
    
    produtos.forEach(produto => {
        const produtoCard = document.createElement('div');
        produtoCard.className = 'produto-card';
        produtoCard.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}" class="produto-img">
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p class="descricao">${produto.descricao}</p>
                <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                <button onclick="adicionarAoCarrinho(${produto.id})" class="btn">
                    <i class="fas fa-cart-plus"></i> Adicionar
                </button>
            </div>
        `;
        
        produtosContainer.appendChild(produtoCard);
    });
}

// Adicionar ao Carrinho
async function adicionarAoCarrinho(produtoId) {
  try {
    const response = await fetch(`http://localhost:3000/api/produtos/${produtoId}`);
    const produto = await response.json();

// Adiciona ao carrinho (armazenado no localStorage)
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.push({
      id: produto._id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1
    });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    alert(`${produto.nome} foi adicionado ao carrinho!`);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
  }
}

// Adicionar ao Carrinho
function adicionarAoCarrinho(idProduto) {
    const produto = produtos.find(produto => produto.id === idProduto);
    if (!produto) return;
    
// Verifica se o produto já está no carrinho
    const itemExistente = carrinho.find(item => item.id === idProduto);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }
    
    atualizarCarrinho();
    mostrarNotificacao(`${produto.nome} foi adicionado ao carrinho!`);
}

// Atualizar Contador do Carrinho
function atualizarCarrinho() {
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    carrinhoContador.textContent = totalItens;
    
// Salva no localStorage
localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Mostrar Notificação
function mostrarNotificacao(mensagem) {
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.classList.add('fade-out');
        setTimeout(() => {
            notificacao.remove();
        }, 500);
    }, 3000);
}

// Carregar Carrinho do localStorage
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
        atualizarCarrinho();
    }
}

// Inicialização
window.onload = function() {
    renderizarProdutos();
    carregarCarrinho();
    
// Adiciona classe active ao link clicado
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
};

// Adiciona estilo para notificações
const style = document.createElement('style');
style.textContent = `
    .notificacao {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--verde-primario);
        color: white;
        padding: 1rem;
        border-radius: 5px;
        box-shadow: var(--sombra);
        z-index: 1000;
        animation: fadeIn 0.5s;
    }
    
    .fade-out {
        animation: fadeOut 0.5s;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
`;
document.head.appendChild(style);

// No seu script.js existente
document.querySelector('.carrinho-btn a').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'carrinho.html';
});

document.querySelector('.contato-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso!');
    e.target.reset();
});

