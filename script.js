let currentSong = new Audio();
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
const playMusic = (track) => {
    // let audio = new Audio("/songs/" + track)/
    currentSong.src = "/songs/" + track
    currentSong.play()
    play.src = "pause.svg"
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function main(){
    let songs = await getSongs()
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
}
main();

let html  = document.getElementsByClassName("search-container")[0]
html.innerHTML = html.innerHTML + `<input type="text" class="search-input" placeholder="What do you want to play?">`
