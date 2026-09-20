export default {
    onLoad: async () => {
        console.log("SlowPlugin loading...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("SlowPlugin loaded!");
    },
    onUnload: async () => {
        console.log("SlowPlugin unloading...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("SlowPlugin unloaded!");
    }
}
