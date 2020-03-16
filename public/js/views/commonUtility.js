let commonUtility = {};
commonUtility.setNavActive = function () {
  let pathname = window.location.pathname;
  let linkObj = {};

  if(pathname.includes('index')){
    linkObj = $('#kt_aside_menu_wrapper ul.kt-menu__nav li a[href="/index"]');
    linkObj.parent().addClass('kt-menu__item--active');
    return false;
  }
  if(pathname.includes('knowledge')){
    pathname = '/knowledge';
  }

  linkObj = $(`#kt_aside_menu_wrapper ul.kt-menu__nav li a[href="${pathname}"]`);
  linkObj.parent().addClass('kt-menu__item--active');
  linkObj.parent().parent().parent().parent().addClass('kt-menu__item--open');
};

commonUtility.isEmpty = function (value) {
  return value === '' || value === undefined;
};

commonUtility.isEmptyList = function (list) {
  return list === null || list.length === 0;
};

commonUtility.setCookie = function (name, value, remember) {
  let days = remember ? 30 : 1;
  let exp = new Date();
  exp.setTime(exp.getTime() + days*24*60*60*1000);
  document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
};

commonUtility.getCookie = function (name) {
  let reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  let arr = document.cookie.match(reg);
  if(arr === null){
    return null;
  }
  return unescape(arr[2]);
};

commonUtility.delCookie = function (name) {
  let exp = new Date();
  exp.setTime(exp.getTime() - 1);
  let cookieName = this.getCookie(name);
  if(cookieName !== null)
    document.cookie= name + "=" + cookieName + ";expires=" + exp.toGMTString();
};

commonUtility.getLoginUser = function () {
  let cookie = this.getCookie(Constants.COOKIE_LOGIN_USER);
  if(cookie === null){
    location.href = '/';
  }
  return JSON.parse(cookie);
};

commonUtility.buildUniversityUploadRemoteUri = function (serviceUrl, universityCode, dirName) {
  let systemName = 'shs';
  return `${serviceUrl}?system=${systemName}&customer=university&universityCode=${universityCode}&dirName=${dirName}`;
};

commonUtility.buildEnterpriseUploadRemoteUri = function (serviceUrl, companyName, dirName) {
  let systemName = 'shs';
  return `${serviceUrl}?system=${systemName}&customer=enterprise&companyName=${companyName}&dirName=${dirName}`;
};

commonUtility.buildSystemRemoteUri = function (serviceUrl, dirJson) {
  let systemName = 'shs';
  let remoteUri = `${serviceUrl}?system=${systemName}`;
  for (let key in dirJson) {
    remoteUri += `&${key}=${dirJson[key]}`;
  }
  //return `${serviceUrl}?system=${systemName}&dirName=${dirNames}`;
  return remoteUri;
};