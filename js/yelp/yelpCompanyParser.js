class YelpCompanyParser {
  findCompanyInfo(e) {
    e = this.getCompanyBlock(e);
    if (!e) return null;
    var r = this.findMainBlock(e),
      s = this.findCompanyPropertyByName(r ?? e, "name");
    if (!s) return null;
    var t = this.findSourceId(e);
    if (!t) return null;
    (s = { source: "yelp", name: this.htmlDecode(s), source_id: t }),
      (t = this.findCompanyPropertyByName(r ?? e, "telephone")),
      t && (s.phone = t),
      (t = this.findCompanyPropertyByName(r ?? e, "address")),
      t &&
        (t.addressCountry && (s.country = t.addressCountry),
        t.addressRegion && (s.state = t.addressRegion),
        t.streetAddress && (s.street = t.streetAddress),
        t.postalCode && (s.postal = t.postalCode),
        t.addressLocality) &&
        (s.locality = t.addressLocality),
      (t = this.findCompanyPropertyByName(r ?? e, "image")),
      t && (s.logo = t),
      (r = this.findCompTags(e));
    r && (s.comp_tags = r);
    let i = this.findUrl(e);
    i && ((i = (i = this.htmlDecode(i)).split("?")[0]), (s.url = i));
    t = this.findCompanyPropertyByName(e, "requestUrl");
    return t && (s.source_page = t.split("?")[0]), s;
  }
  getCompanyBlock(e) {
    var r = this.findBlocks(e, /<!--({.+?})--><\/script>/gi),
      e = this.findBlocks(
        e,
        /<script type="application\/ld\+json">(.+?)<\/script>/gi
      );
    return r.concat(e);
  }
  findBlocks(e, r) {
    for (var s, t = []; (s = r.exec(e)); ) {
      let r = {};
      try {
        (r = JSON.parse(this.htmlDecode(s[1].trim()))) && t.push(r);
      } catch (e) {
        try {
          (r = JSON.parse(s[1].trim())) && t.push(r);
        } catch (e) {}
      }
    }
    return t;
  }
  findMainBlock(e) {
    for (var r of e) if (r.name || r.address) return [r];
  }
  findSourceId(e) {
    for (var r of e) {
      var s = r?.legacyProps?.bizDetailsProps?.bizDetailsMetaProps?.businessId;
      if (s) return s;
      if (
        (s = r?.legacyProps?.bizDetailsProps?.bizDetailsPageProps?.businessId)
      )
        return s;
      if (
        (s = r?.legacyProps?.bizDetailsProps?.bizDetailsVendorProps?.businessId)
      )
        return s;
    }
  }
  findUrl(e) {
    for (var r of e)
      if ("object" == typeof r)
        for (var s in r)
          if (-1 !== s.indexOf("externalResources.website")) return r[s].url;
  }
  findCompTags(e) {
    for (var r of e) {
      r =
        r?.legacyProps?.bizDetailsProps?.gaDimensions?.www
          ?.second_level_categories[1];
      if (r) return r;
    }
  }
  findCompanyPropertyByName(e, r) {
    for (var s of e) if (s[r]) return s[r];
  }
  htmlDecode(e) {
    let r,
      s = document.createElement("div");
    return (s.innerHTML = e), (r = s.textContent), (s = null), r;
  }
}
