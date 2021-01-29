fetch("/channel.json").then(e => {
    e.json().then(channel => {
        channel = channel.channel;

        if(channel === "webpack") {
            channel = "/";
            window.loadedChannelFromWebpack = true;
        }

        if(!channel.endsWith("/")) {
            channel = channel + "/";
        }

        fetch(channel + "webpanelmanifest.json").then(e => {
            e.json().then(data => {
                console.log(data);

                for(const entry of data.entries) {
                    const scripttag = document.createElement("script");
                    scripttag.src = channel + entry;
                    document.body.append(scripttag);
                }
            })
        });
    })
})
