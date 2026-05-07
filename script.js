const songs = [
    {
        id: 0,
        title: "Eetchi Elumichi",
        artist: "A.R. Rahman, Manoj",
        album: "Taj Mahal",
        cover: "taj.png",
        url: "https://res.cloudinary.com/dtolzkugp/video/upload/v1778150519/Eetchi_Elumichi_Official_Video___Full_HD___Taj_Mahal___A.R.Rahman___Bharathiraja___Vairamuthu__Manoj_320k_mchfe1.mp3"
    },
    {
        id: 1,
        title: "Chandiranai Thottathu Yaar",
        artist: "A.R. Rahman, Hariharan",
        album: "Ratchagan",
        cover: "ratchagan.png",
        url: "https://res.cloudinary.com/dtolzkugp/video/upload/v1778150519/Chandiranai_Thottathu_Yaar_-_4K_Video___Ratchagan_Video_Songs___Nagarjuna___AR_Rahman___Sushmita_Sen_320k_er7ydi.mp3"
    }
];

let currentSongIndex = 0;
let isPlaying = false;
let audio = new Audio(songs[currentSongIndex].url);

// DOM Elements
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const currentCover = document.getElementById('current-cover');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');

const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressHandle = document.querySelector('.progress-bar-container .progress-handle');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

const songListContainer = document.getElementById('song-list');

// Initialize App
function init() {
    renderSongCards();
    loadSong(songs[currentSongIndex]);
}

// Render Song Cards
function renderSongCards() {
    songListContainer.innerHTML = '';
    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${song.cover}" alt="${song.album}">
                <button class="card-play-btn" onclick="playSpecificSong(${index}, event)">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="card-title">${song.title}</div>
            <div class="card-desc">${song.artist}</div>
        `;
        songListContainer.appendChild(card);
    });
}

// Load Song Details
function loadSong(song) {
    currentCover.src = song.cover;
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    audio.src = song.url;
}

// Play or Pause
function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    isPlaying = true;
    playIcon.classList.remove('fa-play');
    playIcon.classList.add('fa-pause');
    audio.play();
    updateCardPlayIcons();
}

function pauseSong() {
    isPlaying = false;
    playIcon.classList.remove('fa-pause');
    playIcon.classList.add('fa-play');
    audio.pause();
    updateCardPlayIcons();
}

// Play specific song from card
window.playSpecificSong = function(index, event) {
    event.stopPropagation(); // Prevent card click if any
    if (currentSongIndex === index) {
        togglePlay();
    } else {
        currentSongIndex = index;
        loadSong(songs[currentSongIndex]);
        playSong();
    }
}

function updateCardPlayIcons() {
    const cardBtns = document.querySelectorAll('.card-play-btn i');
    cardBtns.forEach((icon, index) => {
        if (index === currentSongIndex && isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });
}

// Previous Song
function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) playSong();
}

// Next Song
function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > songs.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) playSong();
}

// Format Time
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update Progress Bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;
    
    const progressPercent = (currentTime / duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressHandle.style.left = `${progressPercent}%`;
    
    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(duration);
}

// Set Progress Bar
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    audio.currentTime = (clickX / width) * duration;
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong);

// When metadata is loaded, update the total time
audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

progressContainer.addEventListener('click', setProgress);

// Initialize
init();
