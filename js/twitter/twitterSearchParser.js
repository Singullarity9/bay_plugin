const REG_RESULTS_SECTION = /<section aria-labelledby=([\s\S]+?)<\/section>/i,
  REG_USER_BLOCK =
    /<div role="button".+?data-testid="UserCell">(.+?)<\/span><\/span><\/div>/gi,
  REG_USER_SOURCE_ID_2 = /href="\/(.+?)"/i,
  REG_USER_LOGO =
    /src="(https:\/\/pbs\.twimg\.com\/profile_images\/.+\/.+_normal\.\w{3,4})"/i,
  REG_USER_NAME = /<span.+?">([^"=><]*)<\/span>/i;
function getUserListFromSearch(e) {
  var E = [],
    _ = findDescrByRegEx(e, REG_RESULTS_SECTION, !0);
  for (_ && (e = _); (s = REG_USER_BLOCK.exec(e)); ) {
    var R,
      i,
      s = s[0];
    s &&
      (!(R = findDescrByRegEx(s, REG_USER_SOURCE_ID_2)) ||
        -1 < R.indexOf("=") ||
        -1 < R.indexOf("?") ||
        -1 < R.indexOf(" ") ||
        ((i = findDescrByRegEx(s, REG_USER_NAME)),
        (s = findDescrByRegEx(s, REG_USER_LOGO)),
        E.push({ source_id_2: R, logo: s, name: i })));
  }
  return E;
}
