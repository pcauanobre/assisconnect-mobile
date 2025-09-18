// client/utils/phoneAuthSession.js
// Guarda/restaura o ConfirmationResult entre telas
let _confirmation = null;

export const setPhoneConfirmation = (c) => {
  _confirmation = c;
};
export const getPhoneConfirmation = () => _confirmation;
export const clearPhoneConfirmation = () => {
  _confirmation = null;
};
