import crypto from 'crypto';

function generateRandomCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  let randomCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    randomCode += characters.charAt(randomIndex);
  }

  return randomCode;
}

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function getFileName(url: string){
  const parts = url.split("/");
  const fileNameWithExtension = parts.pop();
  if(fileNameWithExtension){
    const desiredString = parts.slice(-1)[0] + "/" + fileNameWithExtension.replace(/\.[^.]+$/, "");
    return desiredString;
  }
  return '';
}

export {generateRandomCode, isValidUUID, getFileName};
