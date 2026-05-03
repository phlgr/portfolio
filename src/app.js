(function () {
  var birth = new Date(2000, 8, 11);
  var ageEl = document.getElementById("age");
  document.getElementById("year").textContent = new Date().getFullYear();

  function update() {
    var elapsed = (Date.now() - birth.getTime()) / 1e3;
    var years = Math.floor(elapsed / 31557600);
    var frac = ((elapsed % 31557600) / 31557600).toFixed(10).slice(2);
    ageEl.textContent = years + "." + frac;
    requestAnimationFrame(update);
  }

  update();
})();
