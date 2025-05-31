// Versão otimizada e integrada
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const elementos = {
        itensContainer: document.getElementById('itens-carrinho'),
        totalContainer: document.getElementById('total-carrinho'),
        carrinhoVazioMsg: document.getElementById('carrinho-vazio'),
        btnFinalizar: document.querySelector('.btn-finalizar')
    };

// Estado do carrinho
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Renderização
    function renderizarCarrinho() {
        elementos.itensContainer.innerHTML = '';
        
        if (carrinho.length === 0) {
            elementos.carrinhoVazioMsg.style.display = 'block';
            elementos.btnFinalizar.disabled = true;
            return;
        }

        elementos.carrinhoVazioMsg.style.display = 'none';
        elementos.btnFinalizar.disabled = false;

        carrinho.forEach((item, index) => {
            const itemHTML = `
                <div class="item-carrinho">
                    <img src="${item.imagem}" alt="${item.nome}">
                    <div class="item-info">
                        <h3>${item.nome}</h3>
                        <p>R$ ${item.preco.toFixed(2)}</p>
                    </div>
                    <div class="item-controles">
                        <button onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${index}, 1)">+</button>
                        <button onclick="removerItem(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            elementos.itensContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
        atualizarTotal();
    }

// Atualização de quantidade
    window.alterarQuantidade = function(index, change) {
        carrinho[index].quantidade += change;
        
        if (carrinho[index].quantidade <= 0) {
            carrinho.splice(index, 1);
        }
        
        salvarCarrinho();
    };

// Remoção de item
    window.removerItem = function(index) {
        carrinho.splice(index, 1);
        salvarCarrinho();
    };

// Cálculos
    function calcularTotais() {
        const freteSelecionado = document.querySelector('input[name="frete"]:checked').value;
        const metodoPagamento = document.getElementById('metodo-pagamento').value;
        
        const subtotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const frete = { sedex: 15, pac: 10, retirada: 0 }[freteSelecionado] || 0;
        const desconto = metodoPagamento === 'pix' ? subtotal * 0.05 : 0;
        
        return {
            subtotal: subtotal.toFixed(2),
            frete: frete.toFixed(2),
            desconto: desconto.toFixed(2),
            total: (subtotal + frete - desconto).toFixed(2)
        };
    }

    function atualizarTotal() {
        const { total } = calcularTotais();
        elementos.totalContainer.textContent = `R$ ${total}`;
    }

// Persistência
    function salvarCarrinho() {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho();
    }

// Finalização
    elementos.btnFinalizar.addEventListener('click', function(e) {
        e.preventDefault();
        
     const totais = calcularTotais();
        const pedido = {
            itens: carrinho,
            frete: {
                tipo: document.querySelector('input[name="frete"]:checked').value,
                valor: parseFloat(totais.frete)
            },
            pagamento: {
                metodo: document.getElementById('metodo-pagamento').value,
                desconto: parseFloat(totais.desconto)
            },
            total: parseFloat(totais.total),
            data: new Date().toISOString()
        };

        localStorage.setItem('pedidoAtual', JSON.stringify(pedido));
        window.location.href = 'finalizar-compra.html';
    });

// Event listeners
    document.querySelectorAll('input[name="frete"]').forEach(radio => {
        radio.addEventListener('change', atualizarTotal);
    });

    document.getElementById('metodo-pagamento').addEventListener('change', atualizarTotal);

// Inicialização
    renderizarCarrinho();
});