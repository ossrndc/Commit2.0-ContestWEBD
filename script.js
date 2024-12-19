let currentSong = new Audio();
function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds)); // Ensure no negative time
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
async function getSongs(){
    let x = await fetch("http://127.0.0.1:5500/songs/")
    let response = await x.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (const ele of as) {
        if(ele.href.endsWith(".mp3")){
            songs.push(ele.href.split("/songs/")[1])
        }
    }
    return songs
}
const playMusic = (track,pause=false) => {
    // let audio = new Audio("/songs/" + track)/
    currentSong.src = "/songs/" + track
    if(!pause){
        currentSong.play()
        play.src = "pause.svg" 
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function main(){
    let songs = await getSongs()
    playMusic(songs[0],true)
    console.log(songs)
    let songUl = document.querySelector(".songslist").getElementsByTagName("ul")[0]
    for (const element of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert" src="song.svg" alt="">
                                <div class="info">
                                    <div>${element.replaceAll("%20"," ")} </div>
                                    
                                </div>
                                <img class="invert" src="play.svg" alt=""></li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
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
}
main();

let html  = document.getElementsByClassName("search-container")[0]
html.innerHTML = html.innerHTML + `<input type="text" class="search-input" placeholder="What do you want to play?">`
