const http = require("http");
const request = require("then-request");
const fs = require("fs");
http.createServer((req, res) => {
    function end() {
        res.write("</div>");
        res.write("<script> document.getElementById('load').remove();</script>");
        res.end();
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    //write the html stuff
    res.write(fs.readFileSync("styles.html", "utf-8", (e, d) => {
        return d;
    }));
    //how many to test
    //max is 40
    const test=40;
    const offset=0;
    //write the header
    res.write("<h1>Games on Trending</h1>");
    res.write("<p id='load'>Loading...</p>"); //loading thing with load id so we can easily change it
    let done=0; //number of projects done checkingg
    //const c=[]; //projects that are cloud...
    //set up css stuff so it looks nice!
    res.write("<div class='grid-container'>");

    //send the request to get the trending games
    request("GET", `https://api.scratch.mit.edu/explore/projects?limit=${test}&offset=${offset}&language=en&mode=trending&q=games`).done((r) => {
        let t = JSON.parse(r.getBody()); //set t to all the trending projects

        async function checkForCloud(i) {
            let a = [false, i];
            let cloudPromise = new Promise((res, rej) => {
                request("GET", `https://clouddata.scratch.mit.edu/logs?projectid=${t[i].id}&limit=1&offset=0`).done((r) => {
                    a[0] = r.getBody().toString() != "[]";
                    //console.log(a[0]);
                    res(a);
                });
            });
            return await cloudPromise;
        }
        for (let i = 0; i < test; i++) {
            checkForCloud(i).then((a) => {
                done++;
                if (a[0]) {
                    res.write("<div class='gallery'>");
                    res.write(`<img src=${t[a[1]].image}>`);
                    res.write(`<div class='desc'><a href='https://scratch.mit.edu/projects/${t[i].id}' target='_blank'>${t[a[1]].title}</a><br>by:${t[a[1]].author.username}<br>Ranking:${a[1]+1+offset}</div>`);
                    res.write("</div>");
                }
                if(done==test) end();
            });
        }
    });

}).listen(8080);