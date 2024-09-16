const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const COUNTER_FILE = path.join(__dirname, 'public/counter.txt');
const ORDERS_FILE = path.join(__dirname, 'public/pedidos.html'); 

app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json());
app.use(express.static('public'));

// Função para obter o próximo número de pedido
const getNextOrderNumber = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(COUNTER_FILE, 'utf8', (err, data) => {
            if (err && err.code === 'ENOENT') {
                // Arquivo não existe, iniciar contador com 1
                fs.writeFile(COUNTER_FILE, '1', (err) => {
                    if (err) return reject(err);
                    resolve(1);
                });
            } else if (err) {
                return reject(err);
            } else {
                // Arquivo existe, ler o número atual e incrementar
                const orderNumber = parseInt(data, 10);
                const nextOrderNumber = orderNumber + 1;
                fs.writeFile(COUNTER_FILE, nextOrderNumber.toString(), (err) => {
                    if (err) return reject(err);
                    resolve(nextOrderNumber);
                });
            }
        });
    });
};

// Função para criar ou atualizar o arquivo HTML
const updateOrdersFile = (orderHtml) => {
    return new Promise((resolve, reject) => {
        fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
            if (err && err.code === 'ENOENT') {
                // Arquivo não existe, criar novo
                fs.writeFile(ORDERS_FILE, `<html><body><h1>Pedidos</h1>${orderHtml}</body></html>`, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            } else if (err) {
                return reject(err);
            } else {
                // Arquivo existe, atualizar com novos pedidos
                const updatedHtml = data.replace('</body></html>', `${orderHtml}</body></html>`);
                fs.writeFile(ORDERS_FILE, updatedHtml, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            }
        });
    });
};

app.post('/submit-order', async (req, res) => {
    try {
        const pedido = req.body;
        const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const orderNumber = await getNextOrderNumber();
        
        const pedidoHtml = `
            <div>
                <h2>Número do Pedido: ${orderNumber}</h2>
                <p>Data e Hora: ${dataHora}</p>
                <p>Nome: ${pedido.name}</p>
                <p>E-mail: ${pedido.email}</p>
                <p>Endereço: ${pedido.address}</p>
                <p>Sabor: ${pedido.recheio}</p>
                <p>Tamanho: ${pedido.tamanho}</p>
                <hr>
            </div>
        `;
        
        await updateOrdersFile(pedidoHtml);
        res.send('Pedido recebido.');
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao processar o pedido.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
