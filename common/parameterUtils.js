exports.processNumberParameter = function (parameter, defaultValue) {
  if(parameter === undefined){
    return defaultValue;
  }
  if(Number.isNaN(parameter)){
    return defaultValue;
  }
  return parameter;
};
exports.convertSpecialChar = function (v) {
  return v.replace('+', '%2B')
      .replace('/', '%2F')
      .replace('?', '%3F')
      .replace('#', '%23')
      .replace('&', '%26')
      .replace('=', '%3D');
}