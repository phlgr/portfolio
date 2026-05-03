import tailwind from "bun-plugin-tailwind";

await Bun.build({
	entrypoints: ["./index.html"],
	outdir: "./dist",
	minify: true,
	plugins: [tailwind],
});

Bun.write("./dist/preview.png", Bun.file("./preview.png"));
