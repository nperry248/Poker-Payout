def settler(names, buy_ins, buy_outs):
    # These lines below just make sure that the totals are equal in and out (no errors when getting chips)
    total_in = 0
    total_out = 0

    for i in range(len(buy_ins)):
        total_in += buy_ins[i]
        total_out += buy_outs[i]

    if total_in != total_out:
        print("Total's aren't even, error in chips")

    # makes the ledger 
    ledger = {
        'Names': names,
        'In': buy_ins,
        'Out':buy_outs
    }


    #  Calculates the net pos or neg of each player after the game
    nets = {}
    for i in range(len(ledger['Names'])):
        nets[ledger['Names'][i]] = ledger['Out'][i] - ledger['In'][i]


    # check to see if total of the nets is equal to the totals
    out_sum = 0

    for value in nets.values():
        value += out_sum

    if out_sum != 0:
        print('Wrong Inputs')

    # split into winner dicts and loser dicts
    winners = {}
    losers = {}
    evens = {}


    for key, value in nets.items():
        if value < 0:
            losers[key] = value
        elif value > 0:
            winners[key] = value
        else:
            evens[key] = value


    # if any players broke even, this tells that they're good to go
    list_even_players = []

    if len(evens) > 0:
        for key in evens.keys():
            list_even_players.append(key)
        even_players = ', '.join(list_even_players)
        print("The following players have broke even and need do nothing: {}".format(even_players))


    # The code below is the algorithmic part of the script

    # puts the payers into a list like so ['Nick': 45, 'John': 50, etc.]
    payers = list(losers.items())

    # Loops through payers and their balances 
    for payer, payer_balance in payers:

        # checks if their balance is zero, if so, it goes onto the next payer
        if payer_balance == 0:
            continue

        # loops through winners 
        for receiver, receiver_balance in winners.items():
            # if their balance is zero, they've already been paid and the next winner gets dealt with
            if receiver_balance == 0:
                continue
            
            # Finds the payment between the two given players based on who has the least to pay/get paid
            payment = min(abs(payer_balance), receiver_balance)

            # updates the balances 
            payer_balance += payment
            receiver_balance -= payment

            # Tells the user who pays what
            print(payer + ' pays ' + receiver + ' $' + str(payment))

            # Updates the dictionaries 
            losers[payer] = payer_balance
            winners[receiver] = receiver_balance

            # Checks again if payer balance is zero, and if so breaks, iterating to the next payer
            if payer_balance == 0:
                break
