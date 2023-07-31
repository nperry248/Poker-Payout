// frontend.js

// Function to add a new row to the table
function addPlayerRow() {
    const tableBody = document.getElementById('playerTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="name" placeholder="Enter name"></td>
        <td><input type="number" name="buyIn" placeholder="In"></td>
        <td><input type="number" name="buyOut" placeholder="Out"></td>
        <td><button class="removeButton" type="button" onclick="removePlayerRow(this)">Remove</button></td>
    `;
    tableBody.appendChild(newRow);
}

// Function to remove a row from the table
function removePlayerRow(button) {
    const row = button.parentNode.parentNode;
    row.remove();
}



// Function to gather data from table and return paymentResult response
function settlePayments() {
    const tableBody = document.getElementById('playerTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    const names = [];
    const buyIns = [];
    const buyOuts = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        
        // Get the input values from each row
        const name = cells[0].querySelector('input[name="name"]').value;
        const buyIn = parseInt(cells[1].querySelector('input[name="buyIn"]').value);
        const buyOut = parseInt(cells[2].querySelector('input[name="buyOut"]').value);

        // Push the values into the respective arrays
        names.push(name);
        buyIns.push(buyIn);
        buyOuts.push(buyOut);
    }

    // implement
    const settlementInfo = settler(names, buyIns, buyOuts)
    const trimmedSettlementInfo = settlementInfo.slice(0, -2)
    const settlementText = document.createTextNode(trimmedSettlementInfo);


    const paymentResultDiv = document.getElementById('paymentResult');
    paymentResultDiv.innerHTML = '';

    paymentResultDiv.appendChild(settlementText)
} 

function settler(names, buy_ins, buy_outs) {
    // These lines below just make sure that the totals are equal in and out (no errors when getting chips)
    var total_in = 0;
    var total_out = 0;

    let settlementInfo = '';

    for (var i = 0; i < buy_ins.length; i++) {
        total_in += buy_ins[i];
        total_out += buy_outs[i];
    }

    if (total_in != total_out) {
        settlementInfo += "Total's aren't even, error in chips" + '. ';
    }

    // makes the ledger 
    var ledger = {
        'Names': names,
        'In': buy_ins,
        'Out': buy_outs
    };


    //  Calculates the net pos or neg of each player after the game
    var nets = {};
    for (var i = 0; i < ledger['Names'].length; i++) {
        nets[ledger['Names'][i]] = ledger['Out'][i] - ledger['In'][i];
    }


    // check to see if total of the nets is equal to the totals
    var out_sum = 0;

    for (var value in nets) {
        value += out_sum;
    }

    if (out_sum != 0) {
        console.log('Wrong Inputs');
    }

    // split into winner dicts and loser dicts
    var winners = {};
    var losers = {};
    var evens = {};


    for (var key in nets) {
        if (nets[key] < 0) {
            losers[key] = nets[key];
        } else if (nets[key] > 0) {
            winners[key] = nets[key];
        } else {
            evens[key] = nets[key];
        }
    }


    // if any players broke even, this tells that they're good to go
    var list_even_players = [];

    if (Object.keys(evens).length > 0) {
        for (var key in evens) {
            list_even_players.push(key);
        }
        var even_players = list_even_players.join(', ');
        settlementInfo += even_players + " broke even and need do nothing" + ', ';
    }


    // The code below is the algorithmic part of the script

    // puts the payers into a list like so ['Nick': 45, 'John': 50, etc.]
    var payers = Object.entries(losers);

    // Loops through payers and their balances 
    for (var _i = 0, payers_1 = payers; _i < payers_1.length; _i++) {
        var _a = payers_1[_i],
            payer = _a[0],
            payer_balance = _a[1];

        // checks if their balance is zero, if so, it goes onto the next payer
        if (payer_balance == 0) {
            continue;
        }

        // loops through winners 
        for (var _b = 0, _c = Object.entries(winners); _b < _c.length; _b++) {
            var _d = _c[_b],
                receiver = _d[0],
                receiver_balance = _d[1];

            // if their balance is zero, they've already been paid and the next winner gets dealt with
            if (receiver_balance == 0) {
                continue;
            }

            // Finds the payment between the two given players based on who has the least to pay/get paid
            var payment = Math.min(Math.abs(payer_balance), receiver_balance);

            // updates the balances 
            payer_balance += payment;
            receiver_balance -= payment;

            // Tells the user who pays what
            settlementInfo += payer + ' pays ' + receiver + ' $' + payment + ', ';

            // Updates the dictionaries 
            losers[payer] = payer_balance;
            winners[receiver] = receiver_balance;

            // Checks again if payer balance is zero, and if so breaks, iterating to the next payer
            if (payer_balance == 0) {
                break;
            }
        }
    }
    return settlementInfo
}

