(async () => {
    if (!WebAssembly.instantiateStreaming) { // polyfill
        WebAssembly.instantiateStreaming = async (resp, importObject) => {
            const source = await (await resp).arrayBuffer();
            return await WebAssembly.instantiate(source, importObject);
        };
    }

    const go = new Go();
    const {instance} = await WebAssembly.instantiateStreaming(fetch("wireguard/wireguard.wasm"), go.importObject)
    document.getElementById("calculate-button").disabled = false;
    await go.run(instance)
})()

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("calculator");
    const finalAllowedIPs = document.getElementById("final-allowed-ips");

    form.addEventListener("submit", async event => {
        event.preventDefault()

        const allowedIPs = document.getElementById("allowed-ips").value;
        const disallowedIPs = document.getElementById("disallowed-ips").value;
        const useAPI = document.getElementById("use-api").checked;

        let result
        if (useAPI) {
            const resp = await fetch('/allowedips', {
                method: 'POST',
                body: JSON.stringify({
                    allowed_ips: allowedIPs,
                    disallowed_ips: disallowedIPs
                })
            });

            result = await resp.json();
        } else {
            result = calculateAllowedIPs(allowedIPs, disallowedIPs);
        }

        finalAllowedIPs.classList.remove("alert-success", "alert-error", "alert-info");
        if (result.error) {
            finalAllowedIPs.classList.add("alert-error");
            finalAllowedIPs.textContent = result.error;
        } else {
            finalAllowedIPs.classList.add("alert-success");
            finalAllowedIPs.textContent = "AllowedIPs = " + result.allowed_ips;
        }

        finalAllowedIPs.hidden = false;
    });
});
