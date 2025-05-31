document.addEventListener('DOMContentLoaded', async function() {
    // Recupera o pedido do localStorage
    const pedido = JSON.parse(localStorage.getItem('pedidoAtual'));
    
    if (!pedido) {
        alert('Nenhum pedido encontrado! Redirecionando para o carrinho...');
        window.location.href = 'carrinho.html';
        return;
    }

    // Exibe o resumo do pedido
    exibirResumoPedido(pedido);

    // Configura o formulário
    document.getElementById('form-cliente').addEventListener('submit', async function(e) {
        e.preventDefault();
        await finalizarPedido(pedido);
    });
});

function exibirResumoPedido(pedido) {
    // Itens do pedido
    document.getElementById('resumo-carrinho').innerHTML = `
        <ul>
            ${pedido.itens.map(item => `
                <li class="item-pedido">
                    <span class="quantidade">${item.quantidade}x</span>
                    <span class="nome-produto">${item.nome}</span>
                    <span class="preco-item">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
                </li>
            `).join('')}
        </ul>
    `;

    // Método de entrega
    document.getElementById('metodo-entrega').innerHTML = `
        <h3><i class="fas fa-truck"></i> Entrega</h3>
        <p>${formatarMetodoEntrega(pedido.frete.tipo)} - R$ ${pedido.frete.valor.toFixed(2)}</p>
    `;

    // Método de pagamento
    document.getElementById('metodo-pagamento').innerHTML = `
        <h3><i class="fas fa-credit-card"></i> Pagamento</h3>
        <p>${formatarMetodoPagamento(pedido.pagamento.metodo)}</p>
        ${pedido.pagamento.desconto > 0 ? `
            <p class="desconto">Desconto: R$ ${pedido.pagamento.desconto.toFixed(2)}</p>
        ` : ''}
    `;

    // Total
    document.getElementById('total-pedido').textContent = `R$ ${pedido.total.toFixed(2)}`;
}

function formatarMetodoEntrega(metodo) {
    const metodos = {
        'retirada': 'Retirada em Loja',
        'sedex': 'Sedex',
        'pac': 'PAC'
    };
    return metodos[metodo] || metodo;
}

function formatarMetodoPagamento(metodo) {
    const metodos = {
        'pix': 'PIX (5% de desconto)',
        'cartao': 'Cartão de Crédito'
    };
    return metodos[metodo] || metodo;
}

async function finalizarPedido(pedido) {
    const form = document.getElementById('form-cliente');
    const loading = document.getElementById('loading-finalizacao');
    
    try {
        // Mostra o loading
        loading.style.display = 'block';
        
        // Coleta dados do cliente
        const cliente = {
            nome: document.getElementById('nome').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            endereco: document.getElementById('endereco').value
        };

        // Monta o pedido completo
        const pedidoCompleto = {
            ...pedido,
            cliente,
            data: new Date().toISOString(),
            status: 'pendente'
        };

        // 1. Envia para o backend (API)
        const resposta = await enviarParaBackend(pedidoCompleto);
        
        if (!resposta.success) {
            throw new Error(resposta.message || 'Erro ao processar pedido');
        }

        // 2. Envia mensagem pelo WhatsApp
        await enviarWhatsApp(cliente, pedido, resposta.pedidoId);

        // 3. Limpa o carrinho e redireciona
        localStorage.removeItem('carrinho');
        localStorage.removeItem('pedidoAtual');
        window.location.href = `confirmacao.html?id=${resposta.pedidoId}`;

    } catch (error) {
        alert(`Erro: ${error.message}`);
        console.error('Erro ao finalizar pedido:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// Adicione isso no final da função que processa o formulário
document.getElementById('form-cliente').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const cliente = {
        nome: document.getElementById('nome').value,
        whatsapp: document.getElementById('whatsapp').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value
    };

    const pedidoCompleto = {
        ...pedido, // Dados já existentes do carrinho
        cliente: cliente, // Adiciona os dados do cliente
        data: new Date().toISOString(),
        status: 'confirmado'
    };

    // Salva no localStorage antes de redirecionar
    localStorage.setItem('ultimoPedido', JSON.stringify(pedidoCompleto));
    
    // Redireciona para a página de confirmação
    window.location.href = `confirmacao.html?id=${pedidoId}`;
});

async function enviarParaBackend(pedido) {
    // Simulação - substitua pela sua chamada real à API
    console.log('Enviando para o backend:', pedido);
    
    // Exemplo com fetch:
    /*
    const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    });
    return await response.json();
    */
    
    // Simulando resposta (remova quando implementar a API real)
    return {
        success: true,
        pedidoId: 'ECO' + Math.floor(Math.random() * 10000),
        message: 'Pedido recebido com sucesso'
    };
}

function enviarWhatsApp(cliente, pedido, pedidoId) {
    // Formata a mensagem para o WhatsApp
    const mensagem = ` *Novo Pedido EcoArt* - ${pedidoId}\n\n` +
                     ` *Cliente*: ${cliente.nome}\n` +
                     ` *WhatsApp*: ${cliente.whatsapp}\n` +
                     ` *Email*: ${cliente.email}\n\n` +
                     ` *Itens*:\n${pedido.itens.map(item => 
                         `- ${item.quantidade}x ${item.nome} (R$ ${item.preco.toFixed(2)})\n`).join('')}\n` +
                     ` *Entrega*: ${formatarMetodoEntrega(pedido.frete.tipo)} (R$ ${pedido.frete.valor.toFixed(2)})\n` +
                     ` *Pagamento*: ${formatarMetodoPagamento(pedido.pagamento.metodo)}\n` +
                     ` *Total*: R$ ${pedido.total.toFixed(2)}\n\n` +
                     ` *Observações*: Pedido realizado através do site EcoArt`;
    
    // Codifica a mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Substitua SEU_NUMERO pelo número da loja (com DDI e DDD, sem caracteres especiais)
    const numeroWhatsApp = '5592988527583'; // Exemplo: 55 (Brasil) 11 (DDD) 99999-9999
    
    // Abre o WhatsApp com a mensagem pré-preparada
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`, '_blank');
    
    // Retorna uma promise para usar com async/await
    return Promise.resolve();
}

localStorage.setItem('ultimoPedido', JSON.stringify(pedidoCompleto));

// Adicione isso no final da função que processa o formulário
document.getElementById('form-cliente').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const cliente = {
        nome: document.getElementById('nome').value,
        whatsapp: document.getElementById('whatsapp').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value
    };

    const pedidoCompleto = {
        ...pedido, // Dados já existentes do carrinho
        cliente: cliente, // Adiciona os dados do cliente
        data: new Date().toISOString(),
        status: 'confirmado'
    };

    // Salva no localStorage antes de redirecionar
    localStorage.setItem('ultimoPedido', JSON.stringify(pedidoCompleto));
    
    // Redireciona para a página de confirmação
    window.location.href = `confirmacao.html?id=${pedidoId}`;
});