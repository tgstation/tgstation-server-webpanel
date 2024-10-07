try {
    window.publicPath = import.meta.env.VITE_PUBLIC_PATH;
    function loadChannel(channel) {
        const handler = (e) => {
            if (channel !== publicPath && confirm("The webpanel has failed to load from " + channel + ", this may be due to a misconfiguration. Press OK to load the webpanel from the fallback. Error: \n" + e)) {
                loadChannel(publicPath);
            } else {
                alert("An error has occured within the webpanel bootstraper: \n" + e)
            }
        }

        try {
            if (!channel.endsWith("/")) {
                channel = channel + "/";
            }

            fetch(channel + "webpanelmanifest.json").then(e => {
                e.json().then(data => {
                    const entry = data["src/main.tsx"].file;
                    const scripttag = document.createElement("script");
                    scripttag.src = channel + entry;
                    document.body.append(scripttag);
                }).catch(handler)
            }).catch(handler);
        } catch (e) {
            handler(e)
        }
    }

    if(import.meta.env.VITE_DEV_MODE == "true") {
        import("./main.tsx");
    } else {
        fetch("channel.json", {
            headers: {
                "X-Webpanel-Fetch-Channel": "true"
            }
        }).then(e => {
            e.json().then(channel => {
                if (channel.publicPath && channel.publicPath !== "") {
                    if (!channel.publicPath.endsWith("/")) {
                        channel.publicPath = channel.publicPath + "/";
                    }
                    window.publicPath = channel.publicPath
                }

                document.querySelectorAll(':not(html)').forEach(node => {
                    const { tpl, tplTarget } = node.dataset;

                    if (!tplTarget) return

                    node.setAttribute(tplTarget, tpl.replaceAll("!publicpath!", publicPath))
                });

                loadChannel(channel.channel)
            }).catch((e) => {
                if (confirm("An error has occured within the webpanel bootstraper. Press OK to load the webpanel from the fallback. Error:\n" + e)) {
                    loadChannel(publicPath);
                } else {
                    alert("An error has occured within the webpanel bootstraper: \n" + e)
                }
            })
        })
    }
} catch (e) {
    alert("An error has occured within the webpanel bootstraper: \n" + e)
}
