import crypto from 'crypto';

export const secret = 'abcdefgh';

export const encrypt = value => crypto.createHmac('sha256', secret)
  .update(value)
  .digest('hex');


// const password = '123test123';
// const encryptedPass = encrypt(password);

// console.log('password:', password);
// console.log('encryptedPass:', encryptedPass);
