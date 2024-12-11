const REG_TWITTER_ACCOUNTS = /(^|\W)(@.+?)\b/gi,
  TWITTER_AUTH_HEADER =
    "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
async function setTwitterUserInfo(e, t) {
  const n = getTwitterInfo(await getTwitterData(e, t));
  let r = [];
  if (n.companies) {
    for (var o of n.companies) {
      o = getTwitterInfo(await getTwitterData(o.replace("@", ""), t), !0);
      (o.source_page = "https://twitter.com/" + o.source_id_2), (r = [...r, o]);
    }
    n.companies = r;
  }
  return (
    0 !== r.length &&
      ((n.current = []),
      r.forEach((e) => {
        n.current = [
          ...n.current,
          { company_name: e.name, position: "", source_id: e.source_id },
        ];
      })),
    n
  );
}
async function getTwitterData(e, t, n = 0) {
  let r = {};
  return (
    await $.get({
      url:
        "https://api.twitter.com/graphql/P8ph10GzBbdMqWZxulqCfA/UserByScreenName?variables=%7B%22screen_name%22%3A%22" +
        e +
        "%22%2C%22withHighlightedLabel%22%3Afalse%7D",
      beforeSend: (e) => {
        e.setRequestHeader("authorization", TWITTER_AUTH_HEADER),
          e.setRequestHeader("x-csrf-token", t);
      },
    })
      .done((e) => {
        if (
          !Object.keys(e.data).length ||
          void 0 === e.data.user ||
          void 0 === e.data.user.legacy
        )
          return {};
        r = e.data.user;
      })
      .fail(() => {
        showNotLoginTwitter();
      }),
    r
  );
}
function getTwitterInfo(e = {}, t = !1) {
  let n = {};
  var r,
    o = e["rest_id"],
    {
      name: a,
      description: i = void 0,
      location: c = void 0,
      profile_image_url_https: s = void 0,
      screen_name: u = void 0,
    } = e.legacy,
    e = void 0 !== e.legacy.entities.url ? e.legacy.entities.url.urls : [];
  if (
    ((n = {
      name: a,
      source: "twitter",
      fullInfo: 1,
      source_id: o,
      source_id_2: u,
      locality: c,
      logo: s ? s.replace("_normal", "_200x200") : void 0,
    }),
    t && 0 < e.length && (n.url = e[0].expanded_url),
    e.length &&
      (n.cInfo || (n.cInfo = { u: [] }),
      e.forEach((e) => {
        n.url !== e.expanded_url &&
          n.cInfo.u.push({ [e.expanded_url]: "CUSTOM" });
      }),
      void 0 === n.cInfo.u[0]) &&
      delete n.cInfo.u,
    i && !t)
  )
    for (; (r = REG_TWITTER_ACCOUNTS.exec(i)); )
      r[2] &&
        (n.companies || (n.companies = []), -1 === n.companies.indexOf(r[2])) &&
        r[2] !== u &&
        n.companies.push(r[2]);
  return (
    i &&
      t &&
      (a = searchEmailsO(i)) &&
      0 < a.length &&
      (n.cInfo || (n.cInfo = {}), (n.cInfo.e = a)),
    n.cInfo && !Object.keys(n.cInfo).length && delete n.cInfo,
    n
  );
}
