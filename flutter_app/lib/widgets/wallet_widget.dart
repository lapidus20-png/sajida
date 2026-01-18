import 'package:flutter/material.dart';
import '../services/wallet_service.dart';

class WalletWidget extends StatefulWidget {
  final String userId;

  const WalletWidget({Key? key, required this.userId}) : super(key: key);

  @override
  State<WalletWidget> createState() => _WalletWidgetState();
}

class _WalletWidgetState extends State<WalletWidget> {
  final _walletService = WalletService();
  double _balance = 0.0;
  List<Map<String, dynamic>> _transactions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadWalletData();
  }

  Future<void> _loadWalletData() async {
    setState(() {
      _loading = true;
    });

    final balance = await _walletService.getWalletBalance(widget.userId);
    final transactions = await _walletService.getTransactionHistory(widget.userId);

    setState(() {
      _balance = balance;
      _transactions = transactions;
      _loading = false;
    });
  }

  void _showRechargeDialog() {
    final amounts = [1000, 2000, 5000, 10000, 20000, 50000];
    int selectedAmount = 5000;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Recharger le portefeuille'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Sélectionnez le montant:'),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: amounts.map((amount) {
                  final isSelected = amount == selectedAmount;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedAmount = amount;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.blue : Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$amount FCFA',
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                await _processRecharge(selectedAmount.toDouble());
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              child: const Text('Recharger'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _processRecharge(double amount) async {
    // In a real app, integrate with payment gateway here
    final transactionId = 'TXN${DateTime.now().millisecondsSinceEpoch}';

    final success = await _walletService.rechargeWallet(
      widget.userId,
      amount,
      'mobile_money',
      transactionId,
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Rechargé de $amount FCFA avec succès'),
          backgroundColor: Colors.green,
        ),
      );
      _loadWalletData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors du rechargement'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Balance Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Colors.blue, Colors.blueAccent],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.blue.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Solde du portefeuille',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${_balance.toStringAsFixed(0)} FCFA',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _showRechargeDialog,
                icon: const Icon(Icons.add),
                label: const Text('Recharger'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.blue,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Transactions
        const Text(
          'Historique des transactions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),

        if (_transactions.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: Text(
                'Aucune transaction',
                style: TextStyle(color: Colors.grey),
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _transactions.length,
            itemBuilder: (context, index) {
              final transaction = _transactions[index];
              final isCredit = transaction['type'] == 'credit';

              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isCredit ? Colors.green[100] : Colors.red[100],
                    child: Icon(
                      isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                      color: isCredit ? Colors.green : Colors.red,
                    ),
                  ),
                  title: Text(
                    transaction['description'] ?? 'Transaction',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  subtitle: Text(
                    DateTime.parse(transaction['created_at']).toString().split('.')[0],
                    style: const TextStyle(fontSize: 12),
                  ),
                  trailing: Text(
                    '${isCredit ? '+' : '-'}${transaction['amount']} FCFA',
                    style: TextStyle(
                      color: isCredit ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
