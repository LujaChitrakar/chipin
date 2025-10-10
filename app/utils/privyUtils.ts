export const extractPrivyIdAndEmailFromPrivyUser = (privyUser: any) => {
  const privyId = privyUser.id;
  const email = privyUser.linked_accounts?.find(
    (acc: any) => acc.type === 'email'
  )?.address;

  return {
    privyId,
    email,
  };
};
