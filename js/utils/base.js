function showErrorContent(t = "") {
  $("#error")
    .html("<div>" + t + "</div>")
    .removeClass("hidden"),
    $("#prospectsContainer").hide(),
    $("#domainEmails.domain-page").hide();
}
function debounce(i, a) {
  return function (...t) {
    var l = this.lastCall;
    (this.lastCall = Date.now()),
      l && this.lastCall - l <= a && clearTimeout(this.lastCallTimer),
      (this.lastCallTimer = setTimeout(() => i.apply(null, t), a));
  };
}
