function shortenString(str: string, length = 100) {
  if (!str || length < 1) return;
  return str.length > length
    ? (str.slice(0, length - 1) + '…')
    : str;
}

export default shortenString;
