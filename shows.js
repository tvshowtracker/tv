function initStore() {
    // If not, create it
    if (typeof window.localStorage.tvShowsDataStore === "undefined") {


        window.showsLS = {"settings": {}, "shows": {}};
        if (window.matchMedia) {
            let match = window.matchMedia('(prefers-color-scheme: dark)');
            if (match.matches) {
                window.showsLS.settings.darkmode = true;
            }
        }
        window.localStorage.setItem("tvShowsDataStore", JSON.stringify(window.showsLS));
    }
    let showsLS = getShowsObject();
    if (Object.keys(showsLS.shows).length === 0) {
        document.getElementById("firstTime").classList.remove("hidden");
    }
}

function commitToLS(showsLS) {
    //console.log("Commit", showsLS, Object.keys(showsLS.shows).length, showsLS.shows);
    if (typeof showsLS.settings === "undefined") {
        niceAlert("An error occurred while saving.");
    } else {
        window.showsLS = showsLS;
        window.localStorage.setItem("tvShowsDataStore", JSON.stringify(window.showsLS));
    }
}

function editRenewal(e) {
    document.getElementById("edit-renewal-wrapper").classList.remove("hidden");
    let showsLS = getShowsObject();

    document.getElementById("saveRenewalNote").dataset.show = e.target.dataset.show;
    document.querySelector("#addEditRenewal .showSubheader span.show").innerHTML = showsLS.shows[e.target.dataset.show].show.name;
    document.querySelector("#addEditRenewal #renewalNote").value = showsLS.shows[e.target.dataset.show].renewalNote;
    document.querySelector("#addEditRenewal #renewalNote").focus();


}

function saveRenewalNote() {
    let showsLS = getShowsObject();
    let show = document.getElementById("saveRenewalNote").dataset.show;
    showsLS.shows[show].renewalNote = document.getElementById("renewalNote").value;
    commitToLS(showsLS);
    refreshDisplay(showsLS);
    document.getElementById("renewalNote").value = "";
    document.getElementById("saveRenewalNote").dataset.show = "";
    document.querySelector("#addEditRenewal .showSubheader span.show").innerHTML = "";
    document.getElementById("edit-renewal-wrapper").classList.add("hidden");


}

function addShow(type) {
    document.getElementById("addEdit-wrapper").classList.remove("hidden");
    let addEdit = document.getElementById("addEdit");
    addEdit.dataset.addTo = type;
    addEdit.dataset.mode = "add";
    addEdit.dataset.show = "";
    document.getElementById("addEditName").value = "";
    document.getElementById("addEditName").focus();

}

function getEmoji(show) {


    if (show.show.status === "Ended") {
        return "<span title='Show is marked as ended'>😭</span>";
    } else if (show.nextEpisode) {
        return "<span title='An episode is scheduled!'>🥳</span>";
    } else if (show.renewalNote.match(/renewed/i)) {
        return "<span title='Show has been manually noted as renewed'>😅</span>";
    } else if (show.show.status === "Running") {
        return "<span title='Show is still marked as running'>🧐</span>"
    } else return "<span title='Show status is to be determined'>🤔</span>";
}

document.addEventListener("keyup", function (e) {

    if (e.key === "Escape" && isVisible(document.getElementById("addEdit-wrapper"))) {
        document.getElementById("addEdit-wrapper").classList.add("hidden");
    } else if (e.key === "Escape" && isVisible(document.getElementById("edit-renewal-wrapper"))) {
        document.getElementById("edit-renewal-wrapper").classList.add("hidden");
    } else if (e.key === "Escape" && isVisible(document.getElementById("settings-wrapper"))) {
        document.getElementById("settings-wrapper").classList.add("hidden");
    } else if (e.key === "Escape" && isVisible(document.getElementById("show-details-wrapper"))) {
        document.getElementById("show-details-wrapper").classList.add("hidden");
    } else if (e.key === "Enter" && e.target.id === "addEditName") {
        document.getElementById("searchShow").dispatchEvent(new Event('click'));
    } else if (e.key === "Enter" && e.target.id === "renewalNote") {
        saveRenewalNote();
    }
});
document.getElementById("searchShow").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    searchShows();
});
document.addEventListener("change", function (e) {
    if (e.target.id === "settingsShowNameLink") {
        if (e.target.value === "custom") {
            document.querySelector(".customShowNameLink").classList.remove("hidden");
        } else {
            document.querySelector(".customShowNameLink").classList.add("hidden");
        }
    } else if (e.target.id === "settingsReleaseNotesLink") {
        if (e.target.value === "custom") {
            document.querySelector(".customReleaseNotesLink").classList.remove("hidden");
        } else {
            document.querySelector(".customReleaseNotesLink").classList.add("hidden");
        }
    }

});
document.addEventListener("mouseover", function (e) {
    if (e.target.classList.contains("countdownTitle")) {
        e.target.title=getTimeUntil(new Date(e.target.dataset.airstamp), "Airs in ", "Aired ", "", " ago");
    }
});
document.addEventListener("click", function (e) {
    //console.log("Target is ", e.target, e.target.closest("a"));
    if (e.target.id === "searchShow") {
        searchShows();
    } else if (e.target.closest("#countryCheck")) {
        document.getElementById("countryCheck").classList.add("hidden");
        document.getElementById("countryCheck").classList.remove("ok");
        document.getElementById("countryCheck").classList.remove("notok");
    } else if (e.target.closest("a") === null && e.target.closest(".showlist-item")) {
        if (e.target.closest(".showlist-item").classList.contains("clicked")) {
            e.target.closest(".showlist-item").classList.remove("clicked");
        } else {
            e.target.closest(".showlist-item").classList.add("clicked");
        }
    } else if (e.target.id === "saveRenewalNote") {
        saveRenewalNote();
    } else if (e.target.id === "settingsCheckLocation") {
        if (e.target.checked) {
            document.getElementById("settingsCountryOkRegex").closest(".row").classList.remove("hidden");
        } else {
            document.getElementById("settingsCountryOkRegex").closest(".row").classList.add("hidden");
        }
    } else if (e.target.id === "saveSettings") {
        saveSettings();
    } else if (e.target.id === "export" || (e.target.closest("a") && e.target.closest("a").classList.contains("export"))) {
        exportJSON();
    } else if (e.target.id === "import") {
        let showsLS = getShowsObject();

        if (typeof showsLS.settings === "undefined" || typeof showsLS.shows === "undefined" ||
            (Object.keys(showsLS.settings).length === 0 &&
                Object.keys(showsLS.shows).length === 0)) {
            importJSON();
        } else {
            if (confirm("WARNING: This will overwrite any settings or shows you currently have setup")) {
                importJSON();
            }
        }
    } else if (e.target.classList.contains("toggleSettings")) {
        document.getElementById("settings-wrapper").classList.remove("hidden");
    } else if (e.target.classList.contains("addShow")) {
        markChanged(true);
        addShowToStorage(e.target.dataset.show);
    } else if (e.target.closest("a") !== null && e.target.closest("a").classList.contains("internal") && e.target.closest("a").classList.contains("showName")) {
        doShowNameClick(e);
    } else if (e.target.closest("a") && e.target.closest("a").classList.contains("removeLink")) {
        e.target.closest(".row").remove();
    } else if (e.target.classList.contains("addLink")) {
        addLink(e);
    } else if (e.target.classList.contains("editRenewal")) {
        editRenewal(e);
    } else if (e.target.classList.contains("reload")) {
        reload(e.target);
    } else if (e.target.classList.contains("promote")) {
        promote(e.target.dataset.show);
    } else if (e.target.classList.contains("demote")) {
        demote(e.target.dataset.show);
    } else if (e.target.classList.contains("remove")) {
        remove(e.target.dataset.show);
    } else if (e.target.classList.contains("toggleDarkMode")) {
        toggleDarkMode(e.target);
    } else if (e.target.classList.contains("cancelModal")) {
        closeModal();
    }

});

function exportJSON() {
    markChanged(false);
    let showsLS = getShowsObject();
    let json = JSON.stringify(showsLS);
    let blob = new Blob([json], {type: "application/json"});
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    let date= new Date().toLocaleString().replaceAll(/[^0-9a-zA-Z]+/g, '_');
    a.download = "tvShowTrackerExport_"+date+".json";
    a.href = url;

    a.click();


    commitToLS(showsLS);
}

function importJSON() {

    let input, file, fr;

    if (typeof window.FileReader !== 'function') {
        niceAlert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.createElement('input');
    input.type = "file";
    input.id = "fileinput";
    input.click();
    input.addEventListener('change', function (e) {
        if (!input) {
            niceAlert("Um, couldn't find the fileinput element.");
        } else if (!input.files) {
            niceAlert("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!input.files[0]) {
            niceAlert("Please select a file before clicking 'Load'");
        } else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);

        }

        function receivedText(e) {
            let lines = e.target.result;
            let showsLS = JSON.parse(lines);
            if (typeof showsLS === "object" && typeof showsLS.settings !== "undefined" && typeof showsLS.shows !== "undefined") {
                commitToLS(showsLS);
                refreshDisplay(showsLS);
                markChanged(false);
                closeModal();
            } else {
                niceAlert("The file does not contain valid JSON");
            }
        }
    });

}

function niceAlert(msg, isInfo = false) {
    alert(msg);
}

function closeModal() {
    document.querySelector(".modal:not(.hidden)").classList.add("hidden");
    /*
       document.getElementById("edit-renewal-wrapper").classList.add("hidden");
       document.getElementById("settings-wrapper").classList.add("hidden");
       document.getElementById("show-details-wrapper").classList.add("hidden");
       */

}

function getLinkHref(linkType, show, showsLS) {
    let link;
    switch (showsLS.settings[linkType]) {
        case 'imdb':
            link = "https://www.imdb.com/title/" + show.show.externals.imdb;
            break;
        case 'thetvdb':
            link = "https://www.thetvdb.com/dereferrer/series/" + show.show.externals.thetvdb;
            break;
        case 'duckduckgo':
            link = "https://www.duckduckgo.com?q=" + encodeURIComponent(show.show.name);
            break;
        case 'bing':
            link = "https://www.bing.com?q=" + encodeURIComponent(show.show.name);
            break;
        case 'google':
            link = "https://www.google.com?q=" + encodeURIComponent(show.show.name);
            break;
        case 'custom':
            link = showsLS.settings[linkType + "Custom"].replaceAll("%SHOW%", show.show.name);
            break;
        default:
            link = show.show.tvMazeUrl;
            break;
    }
    return link;
}

function promote(show) {
    let showsLS = getShowsObject();
    showsLS.shows[show].status = "currentShows";
    markChanged(true);
    commitToLS(showsLS);
    refreshDisplay(showsLS);
}

function demote(show) {
    let showsLS = getShowsObject();
    showsLS.shows[show].status = "pendingShows";
    markChanged(true);
    commitToLS(showsLS);
    refreshDisplay(showsLS);
}

function remove(show) {
    let showsLS = getShowsObject();
    if (confirm("Are you sure you want to remove " + showsLS.shows[show].show.name + "?")) {
        delete showsLS.shows[show];
        markChanged(true);
        commitToLS(showsLS);
        refreshDisplay(showsLS);
    }

}

function markChanged(newStatus=true) {
    let showsLS = getShowsObject();
    showsLS.hasChanged=newStatus;
    if (newStatus) {
        document.querySelector("#icons .export").classList.remove("hidden");
    }
    else {
        document.querySelector("#icons .export").classList.add("hidden");
    }
}

function refreshScheduledShows() {
    refreshPendingShows("scheduled");
}

function refreshPendingShows(table = "waiting") {
    let showList = document.querySelectorAll("#" + table + " span.reload");
    for (let i in showList) {
        if (typeof showList[i].classList !== "undefined") {
            showList[i].classList.add("reloadPending");
            showList[i].classList.add("hidden");
            let hg = document.createElement("span");
            hg.classList.add("material-icons");
            hg.classList.add("hourglass");
            hg.innerHTML = "hourglass_top";
            showList[i].insertAdjacentElement("beforebegin", hg);

        }
    }
    refreshNextPendingShow(table);
}

function refreshNextPendingShow(table = "waiting") {

    let next = document.querySelector("#" + table + " span.reloadPending");
    if (next) {
        next.classList.remove("reloadPending");
          next.closest("div").querySelector(".hourglass").classList.add("hidden");

        reload(next, function (hasChanged) {
            let left = document.querySelectorAll("#" + table + " span.reloadPending").length;

            if (left === 0) {
                let showsLS = getShowsObject();
                refreshDisplay(showsLS);
            } else {
                next.closest("div").querySelector(".reloadloader").remove();
                next.closest("div").querySelector(".hourglass").innerHTML="hourglass_empty";
                next.closest("div").querySelector(".hourglass").classList.remove("hidden");

                if (hasChanged) {
                    next.closest(".showlist-item").classList.add("highlight");
                }

                refreshNextPendingShow(table);

            }
        }, 500);
    } else {

    }


}


function reload(me, callback, timeout = 0) {
    let p = me.closest("div");
    me.closest("div.showlist-item").classList.add("loading-wrapper");
    if (p.querySelectorAll(".loader").length === 0) {
        me.classList.add("hidden");
        let loader = document.createElement("span");
        loader.classList.add("reloadloader");
        loader.innerHTML = "<span class='loader'></span>";
        me.insertAdjacentElement("afterend", loader);
    }
    updateShow(me.dataset.show, callback, timeout);

}

function getShowsObject() {
    if (typeof window.showsLS === "undefined") {
        try {
            window.showsLS = JSON.parse(window.localStorage.getItem("tvShowsDataStore"));
            if (!window.showsLS) {
                window.showsLS = {};
            }
            if (typeof window.showsLS.settings === "undefined") {
                window.showsLS.settings = {};
            }
            if (typeof window.showsLS.shows === "undefined") {
                window.showsLS.shows = {};
            }
        } catch (e) {
            window.showsLS = {"settings": {}, "shows": {}};
        }
    }

    return window.showsLS;
}

function showDetailsPretty(show) {
    let div = document.querySelector("#show-details-wrapper div.details");

    let top = document.createElement("div");
    top.classList.add("top");
    let imgDiv = document.createElement("div");
    imgDiv.classList.add("img");
    let img = document.createElement("img");
    img.src = show.image.medium;
    imgDiv.appendChild(img);
    top.appendChild(imgDiv);

    let right = document.createElement("div");
    right.classList.add("right");
    right.innerHTML = "<div><span>Type:</span>" + show.type + "</div>";
    right.innerHTML += "<div><span>Genre(s):</span>" + show.genres.join(", ") + "</div>";
    right.innerHTML += "<div><span>Status:</span>" + show.status + "</div>";
    right.innerHTML += "<div><span>Started:</span>" + getDate(show.premiered) + "</div>";
    right.innerHTML += "<div><span>Ended:</span>" + (show.ended ? getDate(show.ended) : '') + "</div>";
    right.innerHTML += "<div><span>Schedule:</span>" + show.schedule.days.join(", ") + "</div>";
    let nextEpisode = "<div><span>Next Episode:</span>";
    if (typeof show._embedded !== "undefined" && typeof show._embedded.nextepisode !== "undefined") {
        nextEpisode += getDate(show._embedded.nextepisode.airstamp) + " " + show._embedded.nextepisode.airtime;
    }
    nextEpisode += "</div>";
    right.innerHTML += nextEpisode;
    if (typeof show.network !== "undefined" && show.network !== null) {
        right.innerHTML += "<div><span>Network:</span>" + show.network.name + " (" + show.network.country.name + ")</div>";
    } else if (typeof show.webChannel !== "undefined" && show.webChannel !== null) {
        right.innerHTML += "<div><span>WebChannel: "+show.webChannel.name+"</span></div>";
    }

    top.appendChild(right);

    let topDiv = document.createElement("div");

    topDiv.appendChild(top);

    let links = document.createElement("div");
    links.classList.add("links-wrapper");
    // links.innerHTML="<h1>Links</h1>";
    links.innerHTML += "<div><span>TV Maze</span><a href=\"" + show.url + "\" target=\"_blank\">" + show.url + "</a></div>";
    links.innerHTML += "<div><span>IMDB</span><a href=\"https://www.imdb.com/title/" + show.externals.imdb + "/\" target=\"_blank\">https://www.imdb.com/title/" + show.externals.imdb + "/</a></div>";
    links.innerHTML += "<div><span>thetvdb</span><a href=\"https://www.thetvdb.com/dereferrer/series/" + show.externals.thetvdb + "\" target=\"_blank\">https://www.thetvdb.com/dereferrer/series/" + show.externals.thetvdb + "</a></div>";

    topDiv.appendChild(links);
    topDiv.classList.add("imgLinks");


    let seasons = document.createElement("div");
    let seasonsHeader = document.createElement("h2");
    seasonsHeader.innerHTML = "Seasons";
    let seasonsTable = document.createElement("table");
    seasonsTable.classList.add("seasons");
    let html = "<thead><tr><th>Season</th><th>Started</th><th>Ended</th><th># Episodes</th></tr></thead><tbody>";
    show._embedded.seasons.reverse();
    for (let i in show._embedded.seasons) {
        let season = show._embedded.seasons[i];
        html += "<tr><td>" + season.number + "</td><td>" + getDate(season.premiereDate) + "</td><td>" + getDate(season.endDate) + "</td><td>" + (season.episodeOrder === null ? "?" : season.episodeOrder) + "</td></tr>";
    }

    seasonsTable.innerHTML = html + "</tbody>";
    seasons.appendChild(seasonsHeader);
    seasons.appendChild(seasonsTable);


    div.appendChild(topDiv);
    div.appendChild(seasons);

}

function toggleDarkMode(toggleIcon) {
    let html = document.querySelector("html");
    if (html.classList.contains("darkmode")) {
        html.classList.remove("darkmode");
        toggleIcon.innerHTML = "toggle_on";
        toggleIcon.classList.add("material-icons-outlined");
        saveSetting("darkmode", false);
    } else {
        html.classList.add("darkmode");
        toggleIcon.innerHTML = "toggle_off";
        toggleIcon.classList.remove("material-icons-outlined");
        saveSetting("darkmode", true);
    }
}

function saveSettings() {
    let newSettings = document.querySelectorAll(".setting");
    let showsLS = getShowsObject();
    if (!showsLS) {
        showsLS = {};
    }
    for (let i in newSettings) {
        if (typeof newSettings[i] === "object") {
            if (newSettings[i].type === "checkbox") {
                if (typeof newSettings[i].checked !== "undefined" && newSettings[i].checked) {
                    showsLS.settings[newSettings[i].id] = true;
                } else {
                    showsLS.settings[newSettings[i].id] = false;
                }
            } else {
                showsLS.settings[newSettings[i].id] = newSettings[i].value;
            }
        }

    }

    // Now the links
    let linkRows = document.querySelectorAll(".links .row");
    let settingsLinks = [];
    for (let e of linkRows) {
        let thisLink = {
            "name": e.querySelector("input.linkName").value,
            "url": e.querySelector("input.linkUrl").value,
            "search": e.querySelector("input.linkSearch").value,
            "replace": e.querySelector("input.linkReplace").value
        };
        settingsLinks.push(thisLink);
    }
    showsLS.settings.links = settingsLinks;
    markChanged(true);
    commitToLS(showsLS);
    refreshDisplay(showsLS);
    closeModal();

}

function saveSetting(k, v) {
    let showsLS = getShowsObject();
    if (!showsLS.settings) {
        showsLS.settings = {};
    }
    showsLS.settings[k] = v;
    //console.log("SET tvShowsSettings to ",JSON.stringify(settings));
    markChanged(true);
    commitToLS(showsLS);
}

function addLink(e, link = false) {
    let linksWrapper = document.getElementById('settings').querySelector('.links');
    let linkRow = document.createElement("div");
    linkRow.classList.add("link-row");
    let linkNameLabel = document.createElement("label");
    linkNameLabel.innerHTML = "Name";
    linkRow.appendChild(linkNameLabel);
    let linkName = document.createElement("input");
    linkName.classList.add("linkName");
    if (link) {
        linkName.value = link.name;
    }
    linkRow.appendChild(linkName);

    let linkRow2 = document.createElement("div");
    linkRow2.classList.add("link-row");
    let linkUrlLabel = document.createElement("label");
    linkUrlLabel.innerHTML = "URL";
    linkRow2.appendChild(linkUrlLabel);
    let linkUrl = document.createElement("input");
    linkUrl.classList.add("linkUrl");
    if (link) {
        linkUrl.value = link.url;
    }
    linkRow2.appendChild(linkUrl);


    let linkRow3 = document.createElement("div");
    linkRow3.classList.add("link-row");
    linkRow3.classList.add("regex");
    let linkRow3a = document.createElement("div");
    let linkRow3b = document.createElement("div");
    let linkSearchLabel = document.createElement("label");
    linkSearchLabel.innerHTML = "Replace";
    linkRow3a.appendChild(linkSearchLabel);
    let linkSearch = document.createElement("input");
    linkSearch.classList.add("linkSearch");

    if (link) {
        linkSearch.value = link.search;
    }
    linkRow3a.appendChild(linkSearch);
    let linkReplaceLabel = document.createElement("label");
    linkReplaceLabel.innerHTML = "With";
    linkReplaceLabel.classList.add("centered");
    linkRow3b.appendChild(linkReplaceLabel);
    let linkReplace = document.createElement("input");
    linkReplace.classList.add("linkReplace");

    if (link) {
        linkReplace.value = link.replace;
    }
    linkRow3b.appendChild(linkReplace);
    linkRow3.appendChild(linkRow3a);
    linkRow3.appendChild(linkRow3b);

    let div = document.createElement("div");
    div.classList.add("row");
    let trash = document.createElement("a");
    trash.classList.add("removeLink");
    trash.innerHTML = "<span class='material-icons'>delete</span>";

    let linkRowWrapper = document.createElement("div");

    linkRowWrapper.appendChild(linkRow);
    linkRowWrapper.appendChild(linkRow2);
    linkRowWrapper.appendChild(linkRow3);
    div.appendChild(linkRowWrapper);
    div.appendChild(trash);
    linksWrapper.append(div);
    linkName.focus();
}

function doShowNameClick(e) {
    let showsLS = getShowsObject();
    const show = e.target.closest(".showlist-item").dataset.showid;

    document.querySelector("#show-details-wrapper h1").innerHTML = showsLS.shows[show].show.name
    document.querySelector("#show-details-wrapper div.details").innerHTML = "";
    document.querySelector("#show-details-wrapper div.details").classList.add("loader");
    document.getElementById("show-details-wrapper").classList.remove("hidden");

    let url = "https://api.tvmaze.com/shows/" + encodeURIComponent(show) + "?embed[]=nextepisode&embed[]=seasons";
    fetch(url) // Call the fetch function passing the url of the API as a parameter
        .then(res => res.json())
        .then(function (res) {

            document.querySelector("#show-details-wrapper div.details").classList.remove("loader");
            showDetailsPretty(res);


        })
        .catch(function (e) {
            console.error("ERROR", e);
            document.querySelector("#show-details-wrapper div.details").classList.remove("loader");

            // This is where you run code if the server returns any errors
            document.querySelector("#show-details-wrapper div.details").innerHTML = "An error occurred";
        });


}

function updateShow(show, callback, timeout=0) {
    addShowToStorage(show, true, callback, timeout);
}

function addShowToStorage(show, isUpdate = false, callback = false, timeout = 0) {
    //console.log("Add show", show);

    let showsLS = getShowsObject();


    if (typeof showsLS.shows[show] === "undefined" || isUpdate) {

        let resultsDiv = document.getElementById("results");
        resultsDiv.style.opacity = "0";
        let span = document.createElement("span");
        span.classList.add("results-loader");
        span.classList.add("loader");
        resultsDiv.insertAdjacentElement("afterend", span);
        let url = "https://api.tvmaze.com/shows/" + encodeURIComponent(show) + "?embed[]=nextepisode&embed[]=seasons";
        fetch(url, {cache: "no-cache"}) // Call the fetch function passing the url of the API as a parameter
            .then(res => res.json())
            .then(function (res) {
                setTimeout(function() {
                let showObj;
                if (isUpdate) {
                    showObj = structuredClone(showsLS.shows[show]);
                } else {
                    showObj = {"renewalNote": "", "status": document.getElementById("addEdit").dataset.addTo};
                }

                showObj.show = {
                    "name": res.name,
                    "premiered": res.premiered,
                    "ended": res.ended,
                    "externals": res.externals,
                    "network": res.network,
                    "webChannel": res.webChannel,
                    "officialSite": res.officialSite,
                    "day": res.schedule.days,
                    "tvMazeUrl": res.url,
                    "status": res.status
                };


                showObj.nextSeason = null;
                showObj.hasNewSeason = null;

                if (typeof res._embedded !== "undefined" && typeof res._embedded.seasons !== "undefined" && res._embedded.seasons) {
                    let seasons = res._embedded.seasons;
                    seasons.reverse();

                    let today = new Date();

                    for (let s of seasons) {
                        if (s.premiereDate === null) {
                            showObj.hasNewSeason = true;
                            showObj.nextSeason = s.number;
                        } else {
                            if (s.premiereDate > today) {
                                showObj.nextSeason = s.number;

                            } else {
                                break;
                            }
                        }
                    }

                    if (showObj.nextSeason === null) {
                        showObj.nextSeason = parseInt(seasons[0].number) + 1;
                    }


                }

                if (typeof res._embedded !== "undefined" && typeof res._embedded.nextepisode !== "undefined" && res._embedded.nextepisode) {

                    showObj.nextEpisode = {
                        "airstamp": res._embedded.nextepisode.airstamp,
                        "name": res._embedded.nextepisode.name,
                        "number": res._embedded.nextepisode.number,
                        "season": res._embedded.nextepisode.season,
                        "url": res._embedded.nextepisode.url
                    };

                } else {

                    showObj.nextEpisode = null;
                }

                let hasChanged = false;

                if (typeof showsLS.shows[show] === "undefined" || showsLS.shows[show].show.status !== showObj.show.status
                    || (showsLS.shows[show].nextEpisode === null && showObj.nextEpisode !== null)
                    || (showsLS.shows[show].nextEpisode !== null && showObj.nextEpisode !== null && showObj.nextEpisode.airstamp !== showsLS.shows[show].nextEpisode.airstamp)
                ) {
                    if (typeof window.changedShows === "undefined") {
                        window.changedShows = [];
                    }
                    window.changedShows.push(show);
                    hasChanged = true;
                }
                showsLS.shows[show] = showObj;

                let loader = resultsDiv.parentNode.querySelector(".loader");
                commitToLS(showsLS);
                loader.remove();
                resultsDiv.style.opacity = "1";
                resultsDiv.innerHTML = "";
                document.getElementById("addEditName").value = "";
                document.getElementById("addEditName").focus();
                document.getElementById("firstTime").classList.add("hidden");
                if (typeof callback === "function") {
                    callback(hasChanged);
                } else {
                    refreshDisplay(showsLS);
                }

                }, timeout);
            })
            .catch(function (e) {
                console.error("Something went wrong", e);
            });
    } else {
        niceAlert("Error: Show already exists");
    }
}

function searchShows() {
    document.getElementById("results").innerHTML = "<span class='loader'></span>";
    let url = "https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(document.getElementById("addEditName").value);
    fetch(url) // Call the fetch function passing the url of the API as a parameter
        .then(res => res.json())
        .then(function (res) {
            let showsLS = getShowsObject();

            let ul = document.createElement('ul');

            for (let show of res) {
                //console.log("Processing", show, showsLS);
                let li = document.createElement('li');

                if (typeof showsLS.shows[show.show.id] === "undefined") {
                    let a = document.createElement('a');
                    a.classList.add("addShow");
                    a.dataset.show = show.show.id;

                    a.innerHTML = show.show.name;
                    if (show.show.premiered !== null) {
                        a.innerHTML += " (" + show.show.premiered.substring(0, 4)

                         if (typeof show.show.network !== "undefined" && show.show.network !== null) {
                            a.innerHTML += ", " + show.show.network.name;
                        } else if (typeof show.show.webChannel !== "undefined" && show.show.webChannel !== null) {
                            a.innerHTML += ", "+show.show.webChannel.name;
                        }

                         a.innerHTML +=  ")";
                    }

                    li.appendChild(a);
                } else {
                    li.classList.add("already-stored");
                    li.innerHTML = "✔ " + show.show.name;
                    if (show.show.premiered !== null) {
                        li.innerHTML += " (" + show.show.premiered.substring(0, 4) + ")";
                    }
                }
                ul.appendChild(li);

            }
            document.getElementById("results").innerHTML = "";
            document.getElementById("results").style.opacity = "1";
            document.getElementById("results").appendChild(ul);

        })
        .catch(function (e) {
            console.error("Something went wrong", e);
        });
}

function isVisible(elem) {
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

function refreshDisplay(showsLS) {
    if (typeof showsLS === "undefined") {
        showsLS = getShowsObject();
    }
    let items = buildTable(showsLS, "currentShows");
    document.getElementById("current").innerHTML = "";
    document.getElementById("current").appendChild(items);

    items = buildTable(showsLS, "scheduledShows");
    document.getElementById("scheduled").innerHTML = "";
    document.getElementById("scheduled").appendChild(items);

    items = buildTable(showsLS, "pendingShows");
    document.getElementById("waiting").innerHTML = "";
    document.getElementById("waiting").appendChild(items);

    items = buildTable(showsLS, "ended");
    document.getElementById("ended").innerHTML = "";
    document.getElementById("ended").appendChild(items);

    if (typeof window.changedShows !== "undefined" && window.changedShows.length>0) {
        for (let id of window.changedShows) {
            let change=document.querySelector(".showlist-item.show"+id);
            if (change !== null) {
                change.classList.add("highlight");
                change.title="This show has been updated!";
            }
        }
        window.changedShows = [];
    }
}

function buildTable(showsLS, table) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("showList");
    let ended = false;
    let scheduled = false;
    if (table === "ended") {
        ended = true;
        table = "pendingShows";
    }
    if (table === "scheduledShows") {
        scheduled = true;
        table = "pendingShows";
    }
    let ordered = [];
    for (let id in showsLS.shows) {
        ordered.push(id);
    }

    ordered.sort((a, b) => {

        if (table === "currentShows" || scheduled) {

            let fa;
            let fb;
            if (showsLS.shows[a].nextEpisode === null) {
                fa = null;
            } else {
                fa = new Date(showsLS.shows[a].nextEpisode.airstamp);
            }
            if (showsLS.shows[b].nextEpisode === null) {
                fb = null;
            } else {
                fb = new Date(showsLS.shows[b].nextEpisode.airstamp);
            }

            if (fa === null && fb === null) {
                return 0;
            } else if (fa === null) {
                return 1;
            } else if (fb === null) {
                return -1;
            }
            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        } else {

            let fa = showsLS.shows[a].show.name;
            let fb = showsLS.shows[b].show.name;

            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        }
    });

    let today = new Date();
    let nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);


    for (let id of ordered) {

        let show = showsLS.shows[id];
        if (typeof show.status === "undefined" || !show.status) {
            show.status = "currentShows";
        }
        if (show.status === table) {

            let t1 = document.createElement("div");
            if (table === "currentShows") {

                if ((scheduled && show.status === "pendingShows") || (!scheduled && show.status === "currentShows")) {
                    let div = document.createElement("div");

                    if (show.nextEpisode && new Date(show.nextEpisode.airstamp.substring(0, 4), show.nextEpisode.airstamp.substring(5, 7) - 2, parseInt(show.nextEpisode.airstamp.substring(8, 10))) <= new Date()) {
                        t1.innerHTML = "<a class='demote' data-show='" + id + "' title='There is an episode within the next 7 days. You can still click to move down.'><span class='material-icons currentLive demote' data-show='" + id + "'>live_tv</span></a>";
                    } else {
                        t1.innerHTML = "<a class='demote' data-show='" + id + "' title='Move down'><span class='material-icons demote' data-show='" + id + "'>arrow_downward</span></a>";
                    }

                    if (show.nextEpisode && new Date(show.nextEpisode.airstamp) <= today) {
                        div.classList.add("current");
                    }

                    let t2 = document.createElement("div");
                    let t2a = document.createElement("a");
                    t2a.innerHTML = show.show.name;
                    t2a.classList.add("showName");
                    if (showsLS.settings.settingsShowNameLink === "undefined" || !showsLS.settings.settingsShowNameLink || showsLS.settings.settingsShowNameLink === "internal") {
                        t2a.classList.add("internal");
                    } else {
                        t2a.target = "_blank";
                        t2a.href = getLinkHref("settingsShowNameLink", show, showsLS);
                    }

                    let searchText = show.show.name;

                    if (show.nextEpisode && show.nextEpisode.number) {
                        let nextEp = document.createElement("span");
                        let seasonText = "S" + show.nextEpisode.season.toString().padStart(2, '0') + "E" + show.nextEpisode.number.toString().padStart(2, '0');
                        searchText += " " + seasonText;
                        nextEp.innerHTML = " (" + seasonText + ")";
                        t2a.appendChild(nextEp);

                    }

                    if (showsLS.settings.settingsAppendToSearch) {
                        searchText += " " + showsLS.settings.settingsAppendToSearch;
                    }
                    t2.appendChild(t2a);
                    let t2_1 = document.createElement("div");
                    t2_1.classList.add("links");
                    t2_1.classList.add("hidden");

                    let pos = 0;
                    if (showsLS.settings.links) {
                        for (let l of showsLS.settings.links) {
                            let thisSearchText=searchText;

                            let a = document.createElement("a");
                            a.innerHTML = l.name;
                            let url = l.url;

                            thisSearchText = thisSearchText.replaceAll(/[^a-zA-Z0-9\s]/g, "");
                            if (l.search) {
                                let sre = new RegExp(l.search, "g");
                                thisSearchText = thisSearchText.replaceAll(sre, l.replace);
                            }

                            url = url.replaceAll(/%SEARCH%/g, encodeURIComponent(thisSearchText));

                            if (showsLS.settings.settingsOpenLinksInNewWindow) {
                                a.target = "_blank";
                            }
                            a.href = url;

                            if (pos > 0) {
                                let separator = document.createElement("span")
                                separator.innerHTML = " · ";
                                t2_1.appendChild(separator);
                            }
                            pos++;
                            t2_1.appendChild(a);

                        }
                    }
                    t2.appendChild(t2_1);

                    t2.title = "Status: " + show.show.status;
                    let t3 = document.createElement("div");
                    let days = "";
                    for (let d of show.show.day) {
                        if (days !== "") {
                            days += ", ";
                        }
                        days += d + "s";
                    }

                    t3.innerHTML = days;
                    let t4 = document.createElement("div");

                    if (show.nextEpisode) {
                        t4.classList.add("countdownTitle");
                        t4.dataset.airstamp=show.nextEpisode.airstamp;
                        t4.innerHTML = getDate(show.nextEpisode.airstamp);
                        t4.title=getDateTitle(show.nextEpisode.airstamp);
                    } else {
                        t4.innerHTML = "<span class='finished'><em>No Episode</em></span>";
                    }
                    let t5 = document.createElement("div");
                    t5.innerHTML = "<a title='Get the latest information for this show' class='reload' data-show='" + id + "'><span class='material-icons reload' data-show='" + id + "'>refresh</span></a>";
                    div.appendChild(t1);
                    div.appendChild(t2);
                    div.appendChild(t3);
                    div.appendChild(t4);
                    div.appendChild(t5);
                    div.classList.add("showlist-item");
                    div.classList.add("show"+id);
                    div.dataset.showid = id;
                    wrapper.appendChild(div);
                }
            }
            else if (table === "pendingShows") {

                if ((ended && show.show.ended) || (scheduled && show.nextEpisode !== null) || (!ended && !scheduled && !show.show.ended && show.nextEpisode === null)) {

                    let div = document.createElement("div");


                    t1.innerHTML = "<a class='promote' data-show='" + id + "' title='Move Up'><span class='material-icons promote' data-show='" + id + "'>arrow_upward</span></a>";


                    let t2 = document.createElement("div");
                    let t2a = document.createElement("a");
                    t2a.innerHTML = show.show.name;

                    if (!scheduled && typeof show.nextSeason !== "undefined" && show.nextSeason) {
                        t2a.innerHTML += " (Season&nbsp;" + show.nextSeason + ")";
                    }

                    t2a.classList.add("showName");
                    if (showsLS.settings.settingsShowNameLink === "undefined" || !showsLS.settings.settingsShowNameLink || showsLS.settings.settingsShowNameLink === "internal") {
                        t2a.classList.add("internal");
                    } else {
                        t2a.target = "_blank";
                        t2a.href = getLinkHref("settingsShowNameLink", show, showsLS);
                    }
                    t2.title = "Status: " + show.show.status;

                    if (scheduled && show.nextEpisode) {
                        let nextEp = "";
                        if (show.nextEpisode.season !== null || show.nextEpisode.number !== null) {
                            nextEp += " (";
                            if (show.nextEpisode.season !== null) {
                                nextEp += "S" + show.nextEpisode.season.toString().padStart(2, '0');
                            }
                            if (show.nextEpisode.number !== null) {
                                nextEp += "E" + show.nextEpisode.number.toString().padStart(2, '0');
                            }
                            nextEp += ")";
                        }


                        nextEp += " : <span class='countdownTitle' data-airstamp='"+show.nextEpisode.airstamp+"' title='"+getTimeUntil(new Date(show.nextEpisode.airstamp), "Airs in ", "Aired ", "", " ago")+"'>" + getDate(show.nextEpisode.airstamp) +"</span>";
                        if (show.nextEpisode && new Date(show.nextEpisode.airstamp) <= today) {
                            t1.innerHTML = "<a class='promote' data-show='" + id + "'><span class='material-icons currentLive promote' data-show='" + id + "'>live_tv</span></a>";

                            div.classList.add("current");
                        } else if (show.nextEpisode && new Date(show.nextEpisode.airstamp) <= nextWeek) {
                            div.classList.add("imminent");
                        }
                        t2a.innerHTML += "<span class='meta'>" + nextEp + "</span>";
                    }
                    t2.appendChild(t2a);

                    let t3 = document.createElement("div");
                    if (typeof showsLS.settings.settingsShowEmojis !== "undefined" && showsLS.settings.settingsShowEmojis) {
                        t3.innerHTML = getEmoji(show);
                        t3.classList.add("smiley");
                    } else {
                        t3.classList.add("noEmojis");
                    }
                    let t4 = document.createElement("div");

                    t4.innerHTML = "";
                    if (ended) {
                        t4.innerHTML += "Ended: " + show.show.ended + " ";
                    } else if (scheduled && show.nextEpisode) {
                        //t4.innerHTML += getDate(show.nextEpisode.airstamp);
                    }

                    let t4a = document.createElement("a");

                    t4a.target = "_blank";
                    t4a.classList.add("releaseNotes");
                    t4a.href = getLinkHref("settingsReleaseNotesLink", show, showsLS);


                    if (show.renewalNote) {
                        t4a.innerHTML += show.renewalNote;
                        t4a.classList.add("hasRenewalNote");
                    } else {
                        if (typeof show.hasNewSeason !== "undefined" && show.hasNewSeason) {
                            //t4a.innerHTML += "<em>Renewed</em>";
                            if (!scheduled) {
                                div.classList.add("renewed");
                            }
                        }

                        t4.classList.add("noRenewalNote");

                        t4a.innerHTML += "<span class='material-icons'>search</span>";
                    }
                    t4.appendChild(t4a);

                    let rn = document.createElement("a");
                    rn.classList.add("editRenewal");
                    rn.dataset.show = id;
                    rn.dataset.renewalNote = show.renewalNote;
                    if (!scheduled && rn.dataset.renewalNote.match(/renewed/i)) {
                        div.classList.add("renewed");
                    }
                    rn.innerHTML = "<span  title='Edit your renewal notes for this show' class='material-icons editRenewal' data-show='" + id + "' >edit</span>";
                    t4.appendChild(rn)


                    let t5 = document.createElement("div");
                    t5.innerHTML = "<a title='Get the latest information for this show' class='reload' data-show='" + id + "'><span class='material-icons reload' data-show='" + id + "'>refresh</span></a>";
                    t5.innerHTML += "<a title='Delete this show' class='remove' data-show='" + id + "'><span class='material-icons remove' data-show='" + id + "'>delete</span></a>";
                    div.appendChild(t1);
                    div.appendChild(t2);
                    div.appendChild(t3);
                    div.appendChild(t4);
                    div.appendChild(t5);
                    div.classList.add("showlist-item");
                    div.classList.add("show"+id);
                    div.dataset.showid = id;
                    wrapper.appendChild(div);
                }

            }

        }
    }
    return wrapper;
}

function getLinks() {
    if (document.getElementById("wrapper").classList.contains("linksShown") && !document.getElementById("countryCheck").classList.contains("notok")) {
        hideLinks();
        return;
    }
    let showsLS = getShowsObject();
    if (showsLS.settings.settingsCheckLocation) {
        let resultsDiv = document.getElementById("countryCheck");
        resultsDiv.classList.remove("hidden");
        resultsDiv.classList.add("checking");
        resultsDiv.classList.remove("ok");
        resultsDiv.classList.remove("notok");
        resultsDiv.innerHTML = "<span class='loader'></span>";
        fetch("https://wtfismyip.com/json")
            .then(res => res.json())
            .then(function (res) {
                resultsDiv.classList.remove("checking");
                let icon = document.createElement("span");
                icon.classList.add("material-icons");
                let details = document.createElement("span");
                details.innerHTML = res.YourFuckingISP + " @ " + res.YourFuckingLocation + "("+res.YourFuckingCountryCode+")";
                let re = new RegExp(showsLS.settings.settingsCountryOkRegex, 'g');
                if (res.YourFuckingCountryCode.match(re)) {
                    resultsDiv.classList.add("ok");
                    icon.innerHTML = "check_circle";
                    showLinks();
                } else {
                    resultsDiv.classList.add("notok");
                    icon.innerHTML = "cancel";
                    hideLinks(false);
                }
                resultsDiv.innerHTML = "";
                resultsDiv.appendChild(icon);
                resultsDiv.appendChild(details);
            })
            .catch(function (e) {
                console.error("ERROR", e);
                if (confirm("An error occurred checking your location. Show links anyway?")) {
                    document.getElementById("countryCheck").classList.add("hidden");
                    document.getElementById("countryCheck").classList.remove("ok");
                    document.getElementById("countryCheck").classList.remove("notok");
                    showLinks();
                } else {
                    hideLinks();
                }
            });
    } else {
        showLinks();
    }
}

function hideLinks(alsoHideBanner=true) {
    let linksList = document.querySelectorAll(".showlist-item .links");
    for (a of linksList) {
        a.classList.add("hidden");
    }
    document.getElementById("wrapper").classList.remove("linksShown");
    if (alsoHideBanner) {
        document.getElementById("countryCheck").classList.add("hidden");
        document.getElementById("countryCheck").classList.remove("ok");
        document.getElementById("countryCheck").classList.remove("notok");
    }
}

function showLinks() {
    let linksList = document.querySelectorAll(".showlist-item .links");
    for (a of linksList) {
        a.classList.remove("hidden");
    }
    document.getElementById("wrapper").classList.add("linksShown");
}

function getDateTitle(dateText) {
    if (dateText === null) {
        return "Unknown";
    }
    else {
        let showsLS = getShowsObject();

        let d = new Date(dateText);
        if (typeof showsLS.settings.settingsDateFormat === "undefined") {
            showsLS.settings.settingsDateFormat = "m/d/Y";
        }

        /*
        let date = showsLS.settings.settingsDateFormat
            .replace('Y', d.getFullYear().toString())
            .replace('y', d.getFullYear().toString().substring(2, 4))
            .replace('m', (d.getMonth() + 1).toString())
            .replace('d', d.getDate().toString())
            .replace('M', (d.getMonth() + 1).toString().padStart(2, '0'))
            .replace('D', d.getDate().toString().padStart(2, '0'));

         */
        let togo=getTimeUntil(d, "Airs in ", "Aired ", "", " ago");
        let date="Airs at "+(d.getHours()+1).toString().padStart(2, '0')+":"+d.getMinutes().toString().padStart(2, '0')+" ("+togo+" from now)";
        return date;
    }
}

function getTimeUntil(date, prefixAfter, prefixBefore, suffixAfter, suffixBefore) {
    let d = Math.abs(date.getTime() - new Date().getTime()) / 1000;                           // delta
    let r = {};                                                                // result
    let s = {                                                                  // structure
        year: 31536000,
        month: 2592000,
        week: 604800, // uncomment row to ignore
        day: 86400,   // feel free to add your own row
        hour: 3600,
        minute: 60,
        second: 1
    };

    let str="";
    let biggest=false;
    Object.keys(s).forEach(function(key){
        r[key] = Math.floor(d / s[key]);
        if (key === "minute") {
            r[key]++;
        }

        if ((r[key]>0) && key!=="second") {
            if (!biggest) {
                biggest=key;
            }
            if (biggest === "day" || biggest === "hour" || biggest === "minute" || key==="year" || key==="month" || key==="week"|| key==="day") {
                if (str) {
                    str+=", ";
                }
                if (key==="day" && (biggest==="year"||biggest==="month"||biggest==="week")) {
                    r[key]++;
                }
                str+=r[key]+" "+key;
                if (r[key]!==1) {
                    str+="s";
                }
            }
        }
        d -= r[key] * s[key];
    });

    // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
    if (date.getTime() > new Date().getTime()) {
        str=prefixAfter+str+suffixAfter;
    }
    else {
        str=prefixBefore+str+suffixBefore;
    }
    return str;

}
function getDate(dateText) {
    if (dateText === null) {
        return "Unknown";
    } else {
        let showsLS = getShowsObject();

        let d = new Date(dateText);
        if (typeof showsLS.settings.settingsDateFormat === "undefined") {
            showsLS.settings.settingsDateFormat = "m/d/Y";
        }
        return showsLS.settings.settingsDateFormat
            .replace('Y', d.getFullYear().toString())
            .replace('y', d.getFullYear().toString().substring(2, 4))
            .replace('m', (d.getMonth() + 1).toString())
            .replace('d', d.getDate().toString())
            .replace('M', (d.getMonth() + 1).toString().padStart(2, '0'))
            .replace('D', d.getDate().toString().padStart(2, '0'));
    }
}

function loadSettings() {

    let showsLS = getShowsObject();

    markChanged(showsLS.hasChanged??false);

    if (typeof showsLS.settings !== "undefined" && showsLS.settings.darkmode) {
        toggleDarkMode(document.querySelector("span.toggleDarkMode"));
    }
    for (let i in showsLS.settings) {
        if (i === "links") {
            for (let l of showsLS.settings.links) {
                addLink(null, l);
            }
        } else {
            let el = document.getElementById(i);
            if (el) {
                let val = showsLS.settings[i];
                if (el.type === "checkbox") {
                    if (val) {
                        el.checked = true;
                        if (el.id === "settingsCheckLocation") {
                            document.getElementById("settingsCountryOkRegex").closest(".row").classList.remove("hidden");
                        }
                    } else {
                        el.checked = false;
                    }
                } else {
                    el.value = val;
                    if (el.id === "settingsShowNameLink" && el.value === "custom") {
                        document.querySelector(".customShowNameLink").classList.remove("hidden");
                    } else if (el.id === "settingsReleaseNotesLink" && el.value === "custom") {
                        document.querySelector(".customReleaseNotesLink").classList.remove("hidden");
                    }
                }

            }
        }

    }

}

initStore();
loadSettings();
refreshDisplay();
