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
    },
    {
        id: 2,
        title: "Enakke Enakkaa",
        artist: "A.R. Rahman, Prashanth",
        album: "Jeans",
        cover: "jeans.png",
        url: "http://res.cloudinary.com/dtolzkugp/video/upload/v1778155929/11_Enakke_Enakkaa_4K_Video_Song___Jeans___A.R.Rahman___Prashanth___Vairamuthu___AishwaryaRai_320k_ukurfs.mp3"
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
const downloadCurrentBtn = document.getElementById('download-current-btn');

// Initialize App
function init() {
    renderSongCards();
    loadSong(songs[currentSongIndex]);
    
    // Initial fetch of uploaded files
    fetchCloudinaryFiles();
    
    // Auto-detect new files every 1 second
    setInterval(fetchCloudinaryFiles, 1000);
}

// Fetch newly uploaded files from cloudinary.json
async function fetchCloudinaryFiles() {
    try {
        // Cache-busting to ensure we always fetch the latest file state
        const response = await fetch('cloudinary.json?t=' + new Date().getTime());
        if (!response.ok) return;
        const data = await response.json();
        
        let newSongsAdded = false;
        
        if (data && data.resources) {
            data.resources.forEach(resource => {
                // Check for audio files
                if (resource.format === 'mp3' || resource.format === 'wav' || resource.is_audio) {
                    // Prevent adding duplicates
                    const exists = songs.some(song => 
                        song.url === resource.secure_url || 
                        song.url === resource.url ||
                        (resource.public_id && song.url.includes(resource.public_id))
                    );
                    
                    if (!exists) {
                        let title = resource.display_name || resource.public_id || 'Unknown Title';
                        // Clean up title for UI
                        title = title.replace(/_/g, ' ');
                        if (title.length > 40) {
                            title = title.substring(0, 40) + '...';
                        }
                        
                        const newSong = {
                            id: songs.length,
                            title: title,
                            artist: "Cloud Upload",
                            album: "Cloud Library",
                            cover: "taj.png", // Default placeholder cover
                            url: resource.secure_url || resource.url
                        };
                        songs.push(newSong);
                        newSongsAdded = true;
                    }
                }
            });
        }
        
        if (newSongsAdded) {
            renderSongCards();
            updateCardPlayIcons(); // Preserve current playback visual state
        }
    } catch (error) {
        console.error("Error fetching newly uploaded files:", error);
    }
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
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                <div class="card-title" style="margin-bottom: 0;">${song.title}</div>
                <button class="control-icon" onclick="downloadSong(${index}, event)" style="width: auto; height: auto; font-size: 14px; padding: 0 4px;" title="Download"><i class="fas fa-download"></i></button>
            </div>
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
window.playSpecificSong = function (index, event) {
    event.stopPropagation(); // Prevent card click if any
    if (currentSongIndex === index) {
        togglePlay();
    } else {
        currentSongIndex = index;
        loadSong(songs[currentSongIndex]);
        playSong();
    }
}

// Download specific song
window.downloadSong = function(index, event) {
    event.stopPropagation();
    const song = songs[index];
    // Modify URL to add fl_attachment for forced download
    const downloadUrl = song.url.replace('/upload/', '/upload/fl_attachment/');
    window.open(downloadUrl, '_blank');
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

if (downloadCurrentBtn) {
    downloadCurrentBtn.addEventListener('click', () => {
        const song = songs[currentSongIndex];
        const downloadUrl = song.url.replace('/upload/', '/upload/fl_attachment/');
        window.open(downloadUrl, '_blank');
    });
}

// Initialize
init();
