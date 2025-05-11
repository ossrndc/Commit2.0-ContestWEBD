let currentSong = new Audio();
let songs;
let currentFolder;
function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds)); // Ensure no negative time
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
async function getSongs(folder){
    currentFolder = folder;
    let x = await fetch(`/${folder}/`)
    let response = await x.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (const ele of as) {
        if(ele.href.endsWith(".mp3")){
            songs.push(ele.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUl = document.querySelector(".songslist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const element of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert" src="svg/song.svg" alt="">
                                <div class="info">
                                    <div>${element.replaceAll("%20"," ")} </div>
                                    
                                </div>
                                <img class="invert" src="svg/play.svg" alt=""></li>`;
    }
    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    songs
}
const playMusic = (track,pause=false) => {
    // let audio = new Audio("/songs/" + track)/
    currentSong.src = `/${currentFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "svg/pause.svg" 
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbums() {
    let x = await fetch(`/songs/`)
    let response = await x.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cards =  document.querySelector(".cards")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

        if(e.href.includes("/songs/")){
            let folder = (e.href.split("/").slice(-2)[0])
            // Get the meta deta of the folder
            let x = await fetch(`/songs/${folder}/info.json`)
            let response = await x.json();
            cards.innerHTML = cards.innerHTML + `<div data-folder="${folder}" class="card"><div class="img">
                            <img class="img hidden" width="100%"  height="160px" src="/songs/${folder}/cover.jpg" alt="" >
                            <div class="play"><div class="play-button"><div class="triangle"></div></div></div>
                        </div><p>${response.description}</p>`
        }
    }
    
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item => {
            console.log(item.currentTarget,item.currentTarget.dataset.folder)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            
        })
    })
    // return songs
}
async function main(){
    // Get all the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0],true)
    console.log(songs)
    // Display all the albums on the page
    displayAlbums()
    
    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    })
    
    // // play the first song
    // var audio = new Audio(songs[0]);
    // audio.play();
    // // HTML audio element 
    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(audio.duration,audio.currentSrc,audio.currentTime)
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    // });        

    // add events for timeupdate
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    })
    // add an event listener to seekbar
    // getBoundingClientRect() -> ham page par kkaha hai woh batata hai
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left =  percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent) /100;
    })
    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",() =>{
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener to close hamburger
    document.querySelector(".close").addEventListener("click",() =>{
        document.querySelector(".left").style.left = "-100%"
    })
    document.getElementById("prev").addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })
    document.getElementById("next").addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index)
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
        else{
            playMusic(songs[0])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) => {
        currentSong.volume = (e.target.value)/100
    })
    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        // if(e.target.src.include("volume.svg")){
        //     e.target.src = e.target.src.replace("volume.svg", "mute.svg") // strings are immutable
        //     currentSong.volume = 0;
        //     document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        // }
        // else{
        //     e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        //     currentSong.volume = 0.10;
        //     document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        // }
    })
}
main();

let html  = document.getElementsByClassName("search-container")[0]
html.innerHTML = html.innerHTML + `<input type="text" class="search-input" placeholder="What do you want to play?">`
