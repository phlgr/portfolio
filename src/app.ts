(() => {
	const birth = new Date(2000, 8, 11);
	const $ = (id: string) => {
		// biome-ignore lint/style/noNonNullAssertion: element exists in HTML
		return document.getElementById(id)!;
	};
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
	const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

	$("year").textContent = String(new Date().getFullYear());

	// Age ticker and local clock
	const ageEl = $("age");
	const clock = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Berlin",
		hour: "2-digit",
		minute: "2-digit",
	});

	function updateAge() {
		const elapsed = (Date.now() - birth.getTime()) / 1e3;
		const years = Math.floor(elapsed / 31557600);
		const frac = ((elapsed % 31557600) / 31557600).toFixed(10).slice(2);
		ageEl.textContent = `${years}.${frac}`;
	}

	function updateClock() {
		$("local-time").textContent = clock.format(new Date());
	}

	updateClock();
	setInterval(updateClock, 30_000);

	// Name: split into letters and fit to the hero width
	const name = $("name");
	const nameText = name.textContent ?? "";
	name.setAttribute("aria-label", nameText);
	name.textContent = "";
	const letters: HTMLElement[] = [];
	[...nameText].forEach((char, i) => {
		const span = document.createElement("span");
		span.className = "ch";
		span.setAttribute("aria-hidden", "true");
		span.style.setProperty("--i", String(i));
		span.textContent = char === " " ? " " : char;
		name.append(span);
		letters.push(span);
	});

	function fitName() {
		const target = name.parentElement?.clientWidth ?? 0;
		name.style.fontSize = "100px";
		const width = name.getBoundingClientRect().width;
		if (width > 0) name.style.fontSize = `${(100 * target) / width}px`;
	}

	fitName();
	document.fonts.ready.then(fitName);
	addEventListener("resize", fitName);

	// About statement: words light up as it scrolls through the viewport
	const statement = $("statement");
	const words = (statement.textContent ?? "").trim().split(/\s+/);
	statement.textContent = "";
	const wordEls = words.map((word, i) => {
		const span = document.createElement("span");
		span.className = "w";
		span.textContent = word;
		statement.append(span, i < words.length - 1 ? " " : "");
		return span;
	});

	function updateStatement() {
		if (reduce) return;
		const rect = statement.getBoundingClientRect();
		const vh = innerHeight;
		const progress = clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.3));
		const lit = progress * wordEls.length;
		wordEls.forEach((el, i) => {
			el.style.setProperty("--o", String(0.15 + 0.85 * clamp(lit - i)));
		});
	}

	updateStatement();
	addEventListener("scroll", updateStatement, { passive: true });

	// Scroll reveals
	const revealEls = document.querySelectorAll("[data-reveal]");
	if (reduce || !("IntersectionObserver" in window)) {
		for (const el of revealEls) el.classList.add("in");
	} else {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.classList.add("in");
					io.unobserve(entry.target);
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
		);
		for (const el of revealEls) io.observe(el);
	}

	// Pointer effects: spotlight, letter weight, magnetic pills, row preview
	const pointer = { x: -999, y: -999 };
	const preview = $("preview");
	const pos = { x: 0, y: 0 };
	let previewOn = false;

	if (finePointer && !reduce) {
		const root = document.documentElement;

		window.addEventListener("pointermove", (e) => {
			pointer.x = e.clientX;
			pointer.y = e.clientY;
			root.style.setProperty("--mx", `${e.clientX}px`);
			root.style.setProperty("--my", `${e.clientY}px`);

			for (const ch of letters) {
				const r = ch.getBoundingClientRect();
				const d = Math.hypot(
					e.clientX - (r.left + r.width / 2),
					e.clientY - (r.top + r.height / 2),
				);
				ch.style.setProperty(
					"--w",
					String(Math.round(800 - 600 * clamp(1 - d / 260))),
				);
			}
		});

		for (const el of document.querySelectorAll<HTMLElement>(".magnetic")) {
			el.addEventListener("pointermove", (e) => {
				const r = el.getBoundingClientRect();
				const dx = e.clientX - (r.left + r.width / 2);
				const dy = e.clientY - (r.top + r.height / 2);
				el.style.transform = `translate(${dx * 0.35}px, ${dy * 0.45}px)`;
			});
			el.addEventListener("pointerleave", () => {
				el.style.transform = "";
			});
		}

		for (const row of document.querySelectorAll<HTMLElement>(".row")) {
			row.addEventListener("pointerenter", () => {
				const thumb = row.querySelector(".thumb");
				if (thumb) preview.replaceChildren(thumb.cloneNode(true));
				if (!previewOn) {
					pos.x = pointer.x;
					pos.y = pointer.y;
				}
				previewOn = true;
				preview.classList.add("on");
			});
			row.addEventListener("pointerleave", () => {
				previewOn = false;
				preview.classList.remove("on");
			});
		}
	}

	function frame() {
		updateAge();
		if (previewOn) {
			const vx = pointer.x - pos.x;
			pos.x += vx * 0.14;
			pos.y += (pointer.y - pos.y) * 0.14;
			const tilt = clamp(vx * 0.06, -14, 14);
			preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
		}
		requestAnimationFrame(frame);
	}

	frame();
})();
