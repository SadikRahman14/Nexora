import ffmpeg from "fluent-ffmpeg";
console.log("FFmpeg loaded:", !!ffmpeg);


export const getVideoDuration = (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
        });
    });
};
