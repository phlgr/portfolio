(() => {
	const birth = new Date(2000, 8, 11);
	const $ = (id: string) => {
		// biome-ignore lint/style/noNonNullAssertion: element exists in HTML
		return document.getElementById(id)!;
	};
	const ageEl = $("age");
	$("year").textContent = String(new Date().getFullYear());

	function update() {
		const elapsed = (Date.now() - birth.getTime()) / 1e3;
		const years = Math.floor(elapsed / 31557600);
		const frac = ((elapsed % 31557600) / 31557600).toFixed(10).slice(2);
		ageEl.textContent = `${years}.${frac}`;
		requestAnimationFrame(update);
	}

	const clock = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Berlin",
		hour: "2-digit",
		minute: "2-digit",
	});

	function updateClock() {
		$("local-time").textContent = clock.format(new Date());
	}

	update();
	updateClock();
	setInterval(updateClock, 30_000);
})();
