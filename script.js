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
    // play the first song
    var audio = new Audio(songs[0]);
    audio.play();

    audio.addEventListener("loadeddata", () => {
        let duration = audio.duration;
        console.log(audio.duration,audio.currentSrc,audio.currentTime)
        // The duration variable now holds the duration (in seconds) of the audio clip
    });        
}
main();

let html  = document.getElementsByClassName("search-container")[0]
html.innerHTML = html.innerHTML + `<input type="text" class="search-input" placeholder="What do you want to play?">`
