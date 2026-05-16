// Always use the mock entry in Vite dev (avoids stale window.kcContext + auth redirects).
if (import.meta.env.DEV) {
    import("./main-kc.dev");
} else if (window.kcContext !== undefined) {
    import("./main-kc");
} else {
    import("./main-kc.dev");
}
