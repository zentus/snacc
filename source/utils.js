export const validateNickname = nickname => {
  nickname = String(nickname).trim()
  const validLength = nickname.length > 1 && nickname.length <= 16
  const validChars = nickname.match(/^[a-zA-Z0-9\-_]{2,16}$/g)
  const hasAlphabetical = nickname.match(/[a-zA-Z]/)

  return Boolean(nickname && validLength && validChars && hasAlphabetical)
}
