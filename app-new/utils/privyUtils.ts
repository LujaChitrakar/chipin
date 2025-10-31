export const extractPrivyIdAndEmailFromPrivyUser = (privyUser: any) => {
  const privyId = privyUser.id;
  const email = privyUser.linked_accounts?.find(
    (acc: any) => acc.type === 'email'
  )?.address;
  const publicKey = privyUser.linked_accounts.find(
    (acc: any) => acc.type === 'wallet'
  )?.address;

  return {
    privyId,
    email,
    wallet_public_key: publicKey,
  };
};
