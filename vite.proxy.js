// vite.proxy.js

export default function createProxy(target) {
    if (!target) {
        throw new Error("VITE_PROXY_TARGET no está definido.");
    }

    return {
        '/api': {
            target,
            changeOrigin: true,
            secure: false
        },
    };
}
