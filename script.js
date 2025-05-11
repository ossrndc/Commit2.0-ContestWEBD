let currentSong = new Audio();
let songs;
let currentFolder;
let isPlaying = false;
let sNN = [];

const folders = ['ncs', 'Ashiqui','cs'];

function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds)); 
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    try {
        currentFolder = folder;
        sNN = []; 
        let x = await fetch(`songs/${folder}/info.json`);
        if (!x.ok) throw new Error(`info.json not found in ${folder}`);
        
        let response = await x.json();
        songs = response.songs;

        if (!Array.isArray(songs)) throw new Error(`songs is not an array in ${folder}/info.json`);

        let songUl = document.querySelector(".songslist ul");
        songUl.innerHTML = "";

        songs.forEach(song => {
            sNN.push(song);
            const songName = song.replaceAll("%20", " ");
            songUl.innerHTML += `
                <li>
                    <img class="invert" src="svg/song.svg" alt="">
                    <div class="info"><div>${songName}</div></div>
                    <img class="invert" src="svg/play.svg" alt="">
                </li>`;
        });

        document.querySelectorAll(".songslist ul li").forEach((li, i) => {
            li.addEventListener("click", () => {
                let sname = sNN[i];
                console.log('Playing song:', sname); 
                playMusic(currentFolder, sname); 
            });
        });

        return songs;

    } catch (err) {
        console.error("getSongs error:", err);
        alert("Error loading songs: " + err.message);
    }
}

const playMusic = (cF, sn, pause = false) => {
    const songPath = `songs/${cF}/${sn}`;
    currentSong.src = songPath;
    document.querySelector(".songInfo").innerHTML = decodeURI(sn); 
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
        let cards = document.querySelector(".cards");

        for (const folder of folders) {
            try {
                let res = await fetch(`songs/${folder}/info.json`);
                if (!res.ok) throw new Error(`No info.json for ${folder}`);

                let metadata = await res.json(); 

                cards.innerHTML += `
                    <div data-folder="${folder}"   class="card  ">
                        <div class="img">
                            <img class="img w-[100%] h-40 "  src="songs/${folder}/cover.jpg" alt="Album cover">
                            <div class="play">
                                <div class="play-button"><div class="triangle"></div></div>
                            </div>
                        </div>
                        <p  class = "text-white">${metadata.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`Skipping folder ${folder}:`, err);
            }
        }

        // npx tailwindcss -i ./css/utility.css -o ./css/style.css --watch

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                console.log(folder);
                songs = await getSongs(`${folder}`);
            });
        });

    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main() {
    await getSongs("ncs");

    if (songs && songs.length > 0) {
        playMusic("ncs", songs[0], true); 
    }

    displayAlbums();

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

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    currentSong.addEventListener("ended", () => {
        play.src = "svg/play.svg";
        isPlaying = false;
    });

    currentSong.addEventListener("error", () => {
        alert("Failed to load the audio file.");
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.getElementById("prev").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(currentFolder, songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(currentFolder, songs[index + 1]);
        } else {
            playMusic(currentFolder, songs[0]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        // Optional mute toggle (uncomment if needed)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });

    document.querySelector(".search-container").innerHTML += `<input type="text" id="searchInput" class="text-white mt-6" placeholder="What do you want to play?">`;
}

main();
