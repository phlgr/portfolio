/**
 * This file is need because the tailwind plugin does currently only work with the Bun.build API, but not with the CLI. Once the plugin supports the CLI, this file can be removed and the build script in package.json can be changed to "bun build".
 * https://bun.com/docs/bundler/html-static#build-for-production-2
 */

await Bun.build({
	entrypoints: ["./index.html"],
	outdir: "./dist",
	minify: true,
});

export {};
