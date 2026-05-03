(() => {
	const birth = new Date(2000, 8, 11);
	// biome-ignore lint/style/noNonNullAssertion: element exists in HTML
	const ageEl = document.getElementById("age")!;
	// biome-ignore lint/style/noNonNullAssertion: element exists in HTML
	document.getElementById("year")!.textContent = String(
		new Date().getFullYear(),
	);

	function update() {
		var elapsed = (Date.now() - birth.getTime()) / 1e3;
		var years = Math.floor(elapsed / 31557600);
		var frac = ((elapsed % 31557600) / 31557600).toFixed(10).slice(2);
		ageEl.textContent = `${years}.${frac}`;
		requestAnimationFrame(update);
	}

	update();
})();
