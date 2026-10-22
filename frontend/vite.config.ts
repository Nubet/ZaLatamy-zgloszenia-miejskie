import { defineConfig } from "vite-plus";

export default defineConfig({
    resolve: {
        alias: { "@": new URL("./src", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1") },
    },
    lint: {
        plugins: ["typescript", "react", "nextjs", "jsx-a11y"],
        ignorePatterns: [".next/**", "next-env.d.ts", "public/**"],
    },
    fmt: { tabWidth: 4, ignorePatterns: [".next/**", "next-env.d.ts", "public/geo/**"] },
    test: {
        include: ["src/**/*.test.ts"],
        environment: "node",
    },
});
