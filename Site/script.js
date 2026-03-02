function addPlayerRow() {
    const tableBody = document.getElementById('playerTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="name" placeholder="Name"></td>
        <td><input type="number" name="buyIn" placeholder="0" min="0"></td>
        <td><input type="number" name="buyOut" placeholder="0" min="0"></td>
        <td><button class="btn-remove" type="button" onclick="removePlayerRow(this)">&#x2715;</button></td>
    `;
    tableBody.appendChild(newRow);
}

function removePlayerRow(button) {
    const row = button.closest('tr');
    const tableBody = document.getElementById('playerTableBody');
    if (tableBody.rows.length > 2) {
        row.remove();
    }
}

function settlePayments() {
    const rows = document.getElementById('playerTableBody').getElementsByTagName('tr');
    const names = [], buyIns = [], buyOuts = [];

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const name = cells[0].querySelector('input').value.trim();
        const buyIn = parseFloat(cells[1].querySelector('input').value);
        const buyOut = parseFloat(cells[2].querySelector('input').value);

        if (!name) {
            showError('All players need a name.');
            return;
        }
        if (isNaN(buyIn) || isNaN(buyOut) || buyIn < 0 || buyOut < 0) {
            showError(`Check the numbers for ${name || 'a player'}.`);
            return;
        }

        names.push(name);
        buyIns.push(buyIn);
        buyOuts.push(buyOut);
    }

    const totalIn = buyIns.reduce((a, b) => a + b, 0);
    const totalOut = buyOuts.reduce((a, b) => a + b, 0);
    const diff = Math.abs(totalIn - totalOut);

    const resultContainer = document.getElementById('resultContainer');
    const paymentResult = document.getElementById('paymentResult');
    resultContainer.classList.remove('hidden');
    paymentResult.innerHTML = '';

    if (diff > 0.01) {
        const direction = totalIn > totalOut ? 'short' : 'over';
        showError(`Chips don't balance — $${diff.toFixed(2)} ${direction}. Check your numbers.`);
        return;
    }

    const nets = {};
    for (let i = 0; i < names.length; i++) {
        nets[names[i]] = buyOuts[i] - buyIns[i];
    }

    const winners = {}, losers = {}, evens = [];

    for (const [name, net] of Object.entries(nets)) {
        if (net > 0) winners[name] = net;
        else if (net < 0) losers[name] = net;
        else evens.push(name);
    }

    const transactions = settle(winners, losers);

    if (evens.length > 0) {
        const evenEl = document.createElement('div');
        evenEl.className = 'result-item even';
        evenEl.textContent = `${evens.join(', ')} broke even — nothing to do.`;
        paymentResult.appendChild(evenEl);
    }

    if (transactions.length === 0 && evens.length === 0) {
        const allEvenEl = document.createElement('div');
        allEvenEl.className = 'result-item even';
        allEvenEl.textContent = 'Everyone broke even — nothing to settle!';
        paymentResult.appendChild(allEvenEl);
        return;
    }

    for (const { payer, receiver, amount } of transactions) {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `<span class="payer">${payer}</span> pays <span class="receiver">${receiver}</span> <span class="amount">$${amount.toFixed(2)}</span>`;
        paymentResult.appendChild(item);
    }

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function settle(winners, losers) {
    const transactions = [];
    const w = { ...winners };
    const l = { ...losers };

    for (const [payer, payer_balance] of Object.entries(l)) {
        let owed = Math.abs(payer_balance);

        for (const receiver of Object.keys(w)) {
            if (w[receiver] <= 0 || owed <= 0) continue;

            const payment = Math.min(owed, w[receiver]);
            owed -= payment;
            w[receiver] -= payment;

            transactions.push({ payer, receiver, amount: payment });
        }
    }

    return transactions;
}

function showError(message) {
    const resultContainer = document.getElementById('resultContainer');
    const paymentResult = document.getElementById('paymentResult');
    resultContainer.classList.remove('hidden');
    paymentResult.innerHTML = `<div class="result-item error">${message}</div>`;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
