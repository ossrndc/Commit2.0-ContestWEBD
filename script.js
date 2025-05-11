let currentSong = new Audio();
let songs;
let currentFolder;
let isPlaying = false;
let sNN = [];

const folders = ['ncs', 'Ashiqui', 'cs'];
const storr_ke = 'musicPlayerState';
const def_vol = 10;

function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds)); 
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
// Here I am taking the song by providing the path of folder from the info,json from inside them as it is simple code so not using node js to read folder
async function getSongs(folder) {
    try {
        currentFolder = folder;
        // Will be storing the songs in this array snn
        sNN = []; 
        let x = await fetch(`songs/${folder}/info.json`);
        if (!x.ok) throw new Error(`info.json not here in ${folder}`);
        // The comig string data into json
        let response = await x.json();
        songs = response.songs;
// Checking if array for error 
        if (!Array.isArray(songs)) throw new Error(`songs is not an array `);
//    will ensure there is nothing else present so songs canbe listed
        let songUl = document.querySelector(".songslist ul");
        songUl.innerHTML = "";
// Rendering the song list
        songs.forEach(song => {
            sNN.push(song);
            const songName = song.replaceAll("%20", " ");
            songUl.innerHTML += 
                `<li>
                    <img class="invert" src="svg/song.svg" alt="">
                    <div class="info"><div>${songName}</div></div>
                    <img class="invert" src="svg/play.svg" alt="">
                </li>`;
        });
//    here I had added an event listener on the all list of song whenever clicked the song of corresponding index will start playing
        document.querySelectorAll(".songslist ul li").forEach((li, i) => {
            li.addEventListener("click", () => {
                let sname = sNN[i];
             
                playMusic(currentFolder, sname); 
            });
        });

        return songs;

    } catch (err) {
        console.error("we encounter  error:", err);
      
    }
}
// Here is the function that play the song where cf is current folder ,sn is song name,and pause is checker ,it set src and play if not pause or pause  if not
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
    // here Saving the current choosen folder and song to the local storage where it is stored in the string we will get that and convert to json to use
    svingstat();
};


//It displays the All album inside the right container ,it usually go folder read name and image
async function displayAlbums() {
    try {
        let cards = document.querySelector(".cards");

        for (const folder of folders) {
            try {
                let res = await fetch(`songs/${folder}/info.json`);
                if (!res.ok) throw new Error(`No info.json for ${folder}`);

                let metadata = await res.json(); 

                cards.innerHTML += 
                    `<div data-folder="${folder}" class="card">
                        <div class="img">
                            <img class="img w-[100%] h-40" src="songs/${folder}/cover.jpg" alt="Album cover">
                            <div class="play">
                                <div class="play-button"><div class="triangle"></div></div>
                            </div>
                        </div>
                        <p class="text-white">${metadata.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`Skipping folder ${folder}:`, err);
            }
        }
  // Here it is applying event listener on all the card so that whenever clicked that stored folder will be passed to get song ,so to display the song list
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                console.log(folder);
                songs = await getSongs(folder);
                svingstat();
            });
        });

    } catch (error) {
        console.error("Here is error loading albums:", error);
    }
}
// Pushing the data to the Browser local storage so if I need when page refresh I can access
function svingstat() {
    let curentsngIndx = 0;
    if (currentSong.src && songs) {
        const currentSongName = currentSong.src.split("/").pop();
        curentsngIndx = songs.indexOf(currentSongName);
    }

    const state = {
        currentFolder: currentFolder,
        curentsngIndx: curentsngIndx,
        volume: document.querySelector(".range input").value,
        isMuted: document.querySelector(".volume>img").src.includes("mute.svg")
    };

    localStorage.setItem(storr_ke, JSON.stringify(state));
}
// This is mainly a functional that handles the final playing of the song as it firstly either get data from local str or froms system ,set volume and accordingly adjust the element inside it in terms of functionality ,Hangle song load,Handle Play,Handle Next,Handle Previous ,Handle Song Duation
async function main() {
 
    const savedState = JSON.parse(localStorage.getItem(storr_ke)) || {
        currentFolder: "ncs",
        curentsngIndx: 0,
        volume: def_vol,
        isMuted: false
    };

  
    currentSong.volume = savedState.volume / 100;
    document.querySelector(".range input").value = savedState.volume;
    
    // Set mute state if needed
    if (savedState.isMuted) {
        const volumeImg = document.querySelector(".volume>img");
        volumeImg.src = volumeImg.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
    }

    // Load songs from saved folder or default
    await getSongs(savedState.currentFolder);

    if (songs && songs.length > 0) {
        const songIndex = Math.min(savedState.curentsngIndx, songs.length - 1);
        playMusic(savedState.currentFolder, songs[songIndex], true);
    }
// Diplayin folder cardd
    displayAlbums();

    // controlling the play and pause
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
        svingstat();
    });
// Dynamically updating the time when the song is playing along with updating of range
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });
//   when song end add the pause
    currentSong.addEventListener("ended", () => {
        play.src = "svg/play.svg";
        isPlaying = false;
        svingstat();
    });
// if error
    currentSong.addEventListener("error", () => {
        alert("Failed to load the audio file.");
    });
// Set song duration as per the changing value of the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });
// Opening of the hamburger when clicked
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
// closinf of it
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });
// taking the index of the song and playing when prev is getting clicked
    document.getElementById("prev").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(currentFolder, songs[index - 1]);
        } else {
            playMusic(currentFolder, songs[songs.length - 1]);
        }
    });
    
    document.getElementById("next").addEventListener("click", () => {
        //Taking the name of the song by spliting the source in two array and taking first
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(currentFolder, songs[index + 1]);
        } else {
            playMusic(currentFolder, songs[0]);
        }
    });
  //Here it is dynamicaly changing the volume 
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
        svingstat();
    });
 // Here it handle when user mute the song and again unmute the song as it will change the svg by checking the src of that element
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = def_vol / 100;
            document.querySelector(".range input").value = def_vol;
        }
        svingstat();
    });
//I am dynamacially inserting the input tag here
    document.querySelector(".search-container").innerHTML += `<input type="text" id="searchInput" class="text-white" placeholder="What do you want to play?">`;

    //    it is here to Save state when song starts playing
    currentSong.addEventListener('play', () => {
        svingstat();
    });
}

main();