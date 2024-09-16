const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const COUNTER_FILE = path.join(__dirname, 'public/counter.txt'); // Caminho absoluto para o arquivo de contador
const ORDERS_FILE = path.join(__dirname, 'public/pedidos.txt'); // Caminho absoluto para o arquivo de pedidos

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

app.post('/submit-order', async (req, res) => {
    try {
        const pedido = req.body;
        const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const orderNumber = await getNextOrderNumber();
        const pedidoFormatado = `Número do Pedido: ${orderNumber}\nData e Hora: ${dataHora}\nNome: ${pedido.name}\nE-mail: ${pedido.email}\nEndereço: ${pedido.address}\nSabor: ${pedido.recheio}\nTamanho: ${pedido.tamanho}\n\n`;
        
        fs.appendFile(ORDERS_FILE, pedidoFormatado, (err) => {
            if (err) {
                console.error('Erro ao gravar o pedido:', err);
                return res.status(500).send('Erro ao processar o pedido.');
            }
            res.send('Pedido recebido.');
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao processar o pedido.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
