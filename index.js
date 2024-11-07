const videoUpload = document.getElementById('videoUpload');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const imagesContainer = document.getElementById('imagesContainer');
const downloadZipButton = document.getElementById('downloadZip');
const ctx = canvas.getContext('2d');

let zip = new JSZip(); // Initialize JSZip instance
let frameCount = 0; // Frame counter
let framesCaptured = 0; // Track number of captured frames

videoUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;
    video.style.display = 'block';
    downloadZipButton.style.display = 'none'; // Hide the download button initially
});

video.addEventListener('loadeddata', function() {
    const interval = 1; // Time interval to capture frame (in seconds)
    frameCount = Math.floor(video.duration / interval); // Estimate the number of frames
    framesCaptured = 0;
    zip = new JSZip(); // Reset the zip file
    video.play();

    const captureFrames = () => {
        const currentTime = video.currentTime;
        if (currentTime < video.duration) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas frame to image
            const imageData = canvas.toDataURL('image/png');

            // Add the image data to the zip file
            zip.file(`frame_${Math.floor(currentTime)}.png`, imageData.split(',')[1], {base64: true});

            // Display the image on the page
            const imgElement = document.createElement('img');
            imgElement.src = imageData;
            imagesContainer.appendChild(imgElement);

            framesCaptured++;
            if (framesCaptured === frameCount) {
                video.pause(); // Stop video when all frames are captured
                downloadZipButton.style.display = 'block'; // Show the download button
            }

            video.currentTime += interval; // Move forward in time
        } else {
            video.pause(); // Stop when the end of the video is reached
        }
    };

    // Capture frames when the video updates
    video.addEventListener('timeupdate', captureFrames);
});

downloadZipButton.addEventListener('click', function() {
    // Once all frames are captured, generate the ZIP file
    zip.generateAsync({type: 'blob'}).then(function(content) {
        // Create a download link for the ZIP file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'video_frames.zip';
        link.click(); // Automatically trigger the download
    });
});
