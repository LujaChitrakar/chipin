export const calculateGroupBalance = (groupData: any, userId: string) => {
  const balances: { [key: string]: number } = {};
  const members = groupData.members.map((m: any) => m._id);

  // Initialize balances for all members
  members.forEach((memberId: string) => {
    balances[memberId] = 0;
  });

  // Process each expense
  groupData.expenses.forEach((expense: any) => {
    const amountPerPerson = expense.amount / expense.split_between.length;
    const paidById = expense.paid_by;

    // Add to payer's "you are owed" and subtract from others' balances
    expense.split_between.forEach((memberId: string) => {
      if (memberId === paidById) {
        balances[memberId] =
          (balances[memberId] || 0) + (expense.amount - amountPerPerson);
      } else {
        balances[memberId] = (balances[memberId] || 0) - amountPerPerson;
      }
    });
  });

  // Calculate for the specific user
  const userBalance = balances[userId] || 0;
  let youOwe = 0;
  let youAreOwed = 0;

  if (userBalance < 0) {
    youOwe = Math.abs(userBalance);
  } else if (userBalance > 0) {
    youAreOwed = userBalance;
  }

  return {
    youOwe: Number(youOwe.toFixed(2)),
    youAreOwed: Number(youAreOwed.toFixed(2)),
    netBalance: Number(userBalance.toFixed(2)),
  };
};
