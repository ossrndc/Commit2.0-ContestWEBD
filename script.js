let currentSong = new Audio();
let songs;
let currentFolder;
let isPlaying = false;

function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds)); // Ensure no negative time
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function getSongs(folder){
    try {
        currentFolder = folder;
        let x = await fetch(`/${folder}/`);
        if (!x.ok) throw new Error(`Failed to fetch songs from /${folder}/`);
        let response = await x.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (const ele of as) {
            if(ele.href.endsWith(".mp3")){
                songs.push(ele.href.split(`/${folder}/`)[1]);
            }
        }

       
        let songUl = document.querySelector(".songslist").getElementsByTagName("ul")[0];
        songUl.innerHTML = "";
        for (const element of songs) {
            songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert" src="svg/song.svg" alt="">
                                    <div class="info">
                                        <div>${element.replaceAll("%20"," ")} </div>
                                    </div>
                                    <img class="invert" src="svg/play.svg" alt=""></li>`;
        }

      
        Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click",element => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            })
        });
        return songs;
    } catch (error) {
        console.error("Error loading songs,Please Try it later:", error);
        alert('Error has been occured');
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    if (!pause) {
        currentSong.play();
        play.src = "svg/pause.svg";
        isPlaying = true;
    } else {
        play.src = "svg/play.svg";
        isPlaying = false;
    }
};

async function displayAlbums() {
    try {
        let x = await fetch(`/songs/`);
        if (!x.ok) throw new Error("Failed to fetch /songs/ directory.");
        let response = await x.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cards = document.querySelector(".cards");
        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

            if (e.href.includes("/songs/")) {
                let folder = (e.href.split("/").slice(-2)[1]);
                try {
                    let x = await fetch(`/songs/${folder}/info.json`);
                    if (!x.ok) throw new Error(`Failed to fetch metadata for folder: ${folder}`);
                    let response = await x.json();
                    cards.innerHTML = cards.innerHTML + `<div data-folder="${folder}" class="card"><div class="img">
                                    <img class="img hidden" width="100%"  height="160px" src="/songs/${folder}/cover.jpg" alt="" >
                                    <div class="play"><div class="play-button"><div class="triangle"></div></div></div>
                                </div><p>${response.description}</p>`;
                } catch (err) {
                    console.warn(`Could not load info.json for folder ${folder}:`, err);
                }
            }
        }

        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log(item.currentTarget, item.currentTarget.dataset.folder);
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            });
        });
    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main(){
    await getSongs("songs/ncs");
    playMusic(songs[0],true);
    console.log(songs);
    displayAlbums();

    // Play/Pause
    play.addEventListener("click", () => {
        if (isPlaying) {
            currentSong.pause();
            play.src = "svg/play.svg";
            isPlaying = false;
        } else {
            currentSong.play();
            play.src = "svg/pause.svg";
            isPlaying = true;
        }
    });

    // Update time and seek
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("ended", () => {
        play.src = "svg/play.svg";
        isPlaying = false;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left =  percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Hamburger toggle
    document.querySelector(".hamburger").addEventListener("click",() =>{
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click",() =>{
        document.querySelector(".left").style.left = "-100%";
    });

    // Previous & Next
    document.getElementById("prev").addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index - 1) >= 0){
            playMusic(songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if((index + 1) < songs.length){
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target);
        // Mute logic (commented out)
        // if(e.target.src.include("volume.svg")){
        //     e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        //     currentSong.volume = 0;
        //     document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        // } else {
        //     e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        //     currentSong.volume = 0.10;
        //     document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        // }
    });
}
main();

let html  = document.getElementsByClassName("search-container")[0];
html.innerHTML = html.innerHTML + `<input type="text" class=" text-white " placeholder="What do you want to play?">`;
