export const calculateGroupBalance = (groupData: any, userId: string) => {
  if (!groupData || !userId) {
    return {
      youAreOwed: 0,
      youOwe: 0,
      netBalance: 0,
      allBalances: {},
    };
  }
  console.log('GROUPDATA:::', JSON.stringify(groupData, null, 2));

  let youAreOwed = 0;
  let youOwe = 0;
  const allBalances: { [key: string]: number } = {};

  // Initialize balances for all members
  groupData.members.forEach((member: any) => {
    if (member._id !== userId) {
      allBalances[member._id] = 0;
    }
  });

  // Calculate total owed and owed to user
  groupData.expenses.forEach((expense: any) => {
    const splitAmount = expense.amount / expense.split_between.length;
    const paidBy = expense.paid_by;
    const isUserPaid = paidBy === userId;
    const userInSplit = expense.split_between.includes(userId);
    if (expense.paid_by === userId) {
      // User paid, others owe user
      expense.split_between.forEach((memberId: string) => {
        if (memberId !== userId) {
          youAreOwed += splitAmount;
          allBalances[memberId] += splitAmount;
        }
      });
    } else if (userInSplit) {
      youOwe += splitAmount;
      allBalances[paidBy] -= splitAmount;
    }
  });

  // Calculate net balance
  const netBalance = youAreOwed - youOwe;

  return {
    youAreOwed: Number(youAreOwed.toFixed(2)),
    youOwe: Number(youOwe.toFixed(2)),
    netBalance: Number(netBalance.toFixed(2)),
    allBalances,
  };
};
