def settle_poker_game(winners, losers):
    payers = list(losers.items())

    for payer, payer_balance in payers:
        if payer_balance == 0:
            continue

        for receiver, receiver_balance in winners.items():
            if receiver_balance == 0:
                continue

            payment = min(abs(payer_balance), receiver_balance)
            payer_balance += payment
            receiver_balance -= payment

            print(payer + ' pays ' + receiver + ' $' + str(payment))

            losers[payer] = payer_balance
            winners[receiver] = receiver_balance

            if payer_balance == 0:
                break

    return winners, losers
