let commonUtility = {};
commonUtility.setNavActive = function () {
  let pathname = window.location.pathname;
  let linkObj = {};

  if(pathname.includes('index')){
    linkObj = $('#kt_aside_menu_wrapper ul.kt-menu__nav li a[href="/index"]');
    linkObj.parent().addClass('kt-menu__item--active');
    return false;
  }

  if(pathname.includes('university')){
    pathname = '/university'
  }
  if(pathname.includes('school')){
    pathname = '/school'
  }
  linkObj = $(`#kt_aside_menu_wrapper ul.kt-menu__nav li a[href="${pathname}"]`);
  linkObj.parent().addClass('kt-menu__item--active');
  linkObj.parent().parent().parent().parent().addClass('kt-menu__item--open');
};

commonUtility.isEmpty = function (value) {
  return value === '' || value === undefined;

};