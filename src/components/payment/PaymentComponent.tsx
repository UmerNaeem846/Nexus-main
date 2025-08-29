import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowDownCircle, ArrowUpCircle, Send, HandCoins } from "lucide-react";

const PaymentPageComponent: React.FC = () => {
  const [balance, setBalance] = useState(2500);
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState("deposit");
  const [transactions, setTransactions] = useState<any[]>([]);

  const [fundingInvestor, setFundingInvestor] = useState("");
  const [fundingEntrepreneur, setFundingEntrepreneur] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");

  const handleAction = (type: string) => {
    if (!amount) return;
    let newBalance = balance;
    if (type === "deposit") newBalance += parseFloat(amount);
    if (type === "withdraw") newBalance -= parseFloat(amount);
    if (type === "transfer") newBalance -= parseFloat(amount);

    setBalance(newBalance);
    setTransactions([
      { id: Date.now(), type, amount, status: "✅ Completed" },
      ...transactions,
    ]);
    setAmount("");
  };

  const handleFundingDeal = () => {
    if (!fundingInvestor || !fundingEntrepreneur || !fundingAmount) return;
    setTransactions([
      {
        id: Date.now(),
        type: "Funding Deal",
        amount: fundingAmount,
        status: `💼 ${fundingInvestor} → ${fundingEntrepreneur}`,
      },
      ...transactions,
    ]);
    setFundingInvestor("");
    setFundingEntrepreneur("");
    setFundingAmount("");
  };

  const iconMap: any = {
    deposit: <ArrowDownCircle className="w-5 h-5" />,
    withdraw: <ArrowUpCircle className="w-5 h-5" />,
    transfer: <Send className="w-5 h-5" />,
    funding: <HandCoins className="w-5 h-5" />,
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">💳 Payments & Wallet</h1>

      {/* Balance Card */}
      <motion.div
        className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Available Balance</p>
            <h2 className="text-3xl font-bold">${balance.toFixed(2)}</h2>
          </div>
          <DollarSign className="w-10 h-10 opacity-70" />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6">
        {["deposit", "withdraw", "transfer", "funding"].map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {iconMap[t]}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Action Box */}
      <motion.div
        className="border rounded-xl p-5 bg-white shadow-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {tab !== "funding" && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="border rounded-md w-full p-2 text-sm mb-3"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(tab)}
              className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md text-sm shadow-md"
            >
              {tab === "deposit"
                ? "Deposit Money"
                : tab === "withdraw"
                ? "Withdraw Money"
                : "Transfer Money"}
            </motion.button>
          </div>
        )}

        {tab === "funding" && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Investor Name</label>
            <input
              type="text"
              value={fundingInvestor}
              onChange={(e) => setFundingInvestor(e.target.value)}
              placeholder="Enter Investor"
              className="border rounded-md w-full p-2 text-sm mb-3"
            />
            <label className="block text-sm font-medium text-gray-600 mb-1">Entrepreneur Name</label>
            <input
              type="text"
              value={fundingEntrepreneur}
              onChange={(e) => setFundingEntrepreneur(e.target.value)}
              placeholder="Enter Entrepreneur"
              className="border rounded-md w-full p-2 text-sm mb-3"
            />
            <label className="block text-sm font-medium text-gray-600 mb-1">Funding Amount (USD)</label>
            <input
              type="number"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              placeholder="Enter Amount"
              className="border rounded-md w-full p-2 text-sm mb-3"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFundingDeal}
              className="bg-green-600 text-white px-5 py-2 rounded-md text-sm shadow-md"
            >
              Create Funding Deal
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Transactions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">📜 Transaction History</h2>
        <div className="overflow-x-auto rounded-lg border shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    className="border-t hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="p-3">{tx.id}</td>
                    <td className="text-blue-600 font-medium">{tx.type}</td>
                    <td>${tx.amount}</td>
                    <td>{tx.status}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentPageComponent;
