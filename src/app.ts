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
	const hourOf = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Berlin",
		hour: "numeric",
		hourCycle: "h23",
	});

	function updateClock() {
		const now = new Date();
		const hour = Number(hourOf.format(now));
		const awake = hour >= 8;
		$("local-time").textContent = clock.format(now);
		$("status").classList.toggle("away", !awake);
		$("status-text").textContent = awake
			? "Online"
			: "Away, it's night in Germany";
	}

	update();
	updateClock();
	setInterval(updateClock, 30_000);
})();
