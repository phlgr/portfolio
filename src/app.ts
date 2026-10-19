const birth = new Date(2000, 8, 11).getTime();
const julianYearMs = 365.25 * 24 * 60 * 60 * 1000;
const $ = (id: string) => {
	const el = document.getElementById(id);
	if (!el) throw new Error(`#${id} not found`);
	return el;
};
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

$("year").textContent = String(new Date().getFullYear());

const ageEl = $("age");
const clock = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/Berlin",
	hour: "2-digit",
	minute: "2-digit",
});

function updateAge() {
	ageEl.textContent = ((Date.now() - birth) / julianYearMs).toFixed(10);
}

function updateClock() {
	$("local-time").textContent = clock.format(new Date());
}

updateClock();
setInterval(updateClock, 30_000);

const name = $("name");
const nameText = name.textContent ?? "";
name.ariaLabel = nameText;
name.textContent = "";
const letters = [...nameText].map((char, i) => {
	const span = document.createElement("span");
	span.className = "ch";
	span.ariaHidden = "true";
	span.style.setProperty("--i", String(i));
	span.textContent = char;
	return span;
});
name.append(...letters);

function fitName() {
	const target = name.parentElement?.clientWidth ?? 0;
	name.style.fontSize = "100px";
	const width = name.getBoundingClientRect().width;
	if (width > 0) name.style.fontSize = `${(100 * target) / width}px`;
}

fitName();
document.fonts.ready.then(fitName);
window.addEventListener("resize", fitName);

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
window.addEventListener("scroll", updateStatement, { passive: true });

const revealEls = document.querySelectorAll("[data-reveal]");
if (reduce) {
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

const pointer = { x: -999, y: -999 };
const preview = $("preview");
const pos = { x: 0, y: 0 };
const previewGap = 24;
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
		const previewTrigger = row.querySelector<HTMLElement>(".row-name");
		if (!previewTrigger) continue;
		previewTrigger.addEventListener("pointerenter", () => {
			const thumb = row.querySelector(".thumb");
			if (thumb) preview.replaceChildren(thumb.cloneNode(true));
			if (!previewOn) {
				pos.x = pointer.x;
				pos.y = pointer.y;
			}
			previewOn = true;
			preview.classList.add("on");
		});
		previewTrigger.addEventListener("pointerleave", () => {
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
		const fitsRight = pos.x + previewGap + preview.offsetWidth < innerWidth;
		const dx = fitsRight ? `${previewGap}px` : `calc(-100% - ${previewGap}px)`;
		preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(${dx}, -50%) rotate(${tilt}deg)`;
	}
	requestAnimationFrame(frame);
}

frame();
