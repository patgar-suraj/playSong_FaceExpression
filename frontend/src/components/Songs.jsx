import { useEffect, useMemo, useRef, useState } from "react";
import { FaRegPlayCircle } from "react-icons/fa";
import { IoIosPause } from "react-icons/io";

const Songs = ({ music }) => {
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Keep refs and state at component level (not inside map) to avoid invalid hook calls
  const audioRefs = useRef([]);
  const [durations, setDurations] = useState([]);
  const [currentTime, setCurrentTime] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes} : ${seconds}`;
  };

  const sortedMusic = useMemo(() => {
    return [...music].sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
  }, [music]);

  const musicWithId = useMemo(() => {
    return sortedMusic.map((song) => ({
      ...song,
      id: song.id ?? crypto.randomUUID(),
    }));
  }, [sortedMusic]);

  const idToIndexMap = useMemo(() => {
    const map = new Map();
    musicWithId.forEach((song, index) => {
      map.set(song.id, index);
    });
    return map;
  }, [musicWithId]);

  useEffect(() => {
    audioRefs.current = [];
    setPlayingId(null);
    setDurations([]);
    setCurrentTime([]);
  }, [musicWithId]);

  const handlePlayPause = (songId) => {
    const index = idToIndexMap.get(songId);
    const audio = audioRefs.current[index];
    if (!audio) return;

    // If clicked item is already playing -> pause it
    if (playingId === songId) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    // Pause currently playing audio (if any)
    if (playingId !== null) {
      const prevIndex = idToIndexMap.get(playingId);
      const prevAudio = audioRefs.current[prevIndex];

      if (prevAudio) {
        prevAudio.pause();
        prevAudio.currentTime = 0;

        setCurrentTime((prev) => {
          const updated = [...prev];
          updated[playingId] = 0;
          return updated;
        });
      }
    }
    // Play the requested audio
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setPlayingId(songId);
  };

  return (
    <div className="bg-[#0f0f0f] border border-b-0 border-[#404040] text-white p-3 w-full h-full overflow-y-scroll rounded-xl">
      <h1 className="font-bold text-2xl">Rcommended Tracks :</h1>
      {musicWithId.length > 0 ? (
        <div>
          {musicWithId.map((song, idx) => {
            const isPlaying = playingId === song.id;
            return (
              <div
                key={song.id}
                className="flex w-full gap-3 items-start justify-between"
              >
                <div className=" relative mt-5 p-2 border-t-2 border-r-2 border-l-2 rounded-xl border-[#2b2b2b] hover:bg-linear-to-b from-[#181818] to-transparent w-full">
                  <h1 className="text-xl font-semibold">
                    {capitalize(song.title)}
                  </h1>
                  <h4 className="text-white/60">{capitalize(song.artist)}</h4>

                  <p className="absolute top-0 right-0 text-sm font-semibold text-white/70 py-1 px-3 rounded-lg m-3 bg-blue-500 w-fit">
                    {formatTime(
                      (durations[idx] || 0) - (currentTime[idx] || 0)
                    )}
                  </p>

                  <div
                    className="w-full h-[4px] hover:h-[6px] hover:cursor-pointer bg-white/20 rounded mt-2 overflow-hidden"
                    onClick={(e) => {
                      const audio = audioRefs.current[idx];
                      if (!audio) return;

                      const duration = durations[idx];
                      if (!Number.isFinite(duration) || duration <= 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      if (rect.width === 0) return;

                      const percent = (e.clientX - rect.left) / rect.width;
                      const newTime = percent * duration;
                      if (Number.isFinite(newTime)) {
                        audio.currentTime = newTime;
                      }
                    }}
                  >
                    <div
                      className="h-full bg-blue-500 transition-all duration-100"
                      style={{
                        width: durations[idx]
                          ? `${((currentTime[idx] || 0) / durations[idx]) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* play pause */}
                <div className="play-pause-btn cursor-pointer active:scale-[0.98] transition-all duration-100 ease-initial flex items-center justify-center mt-5 p-2 border-t-2 border-r-2 border-l-2 rounded-xl hover:bg-linear-to-b from-[#181818] to-transparent border-[#2b2b2b]">
                  <audio
                    ref={(el) => (audioRefs.current[idx] = el)}
                    src={song.audioUrl}
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const newDurations = [...durations];
                      newDurations[idx] = e.target.duration;
                      setDurations(newDurations);
                    }}
                    onTimeUpdate={(e) => {
                      const newTimes = [...currentTime];
                      newTimes[idx] = e.target.currentTime;
                      setCurrentTime(newTimes);
                    }}
                    onEnded={() => {
                      setPlayingId(null);
                      setCurrentTime((prev) => {
                        const updated = [...prev];
                        updated[idx] = 0;
                        return updated;
                      });
                    }}
                  ></audio>

                  <div
                    className="group relative flex items-center justify-center"
                    onClick={() => handlePlayPause(song.id)}
                  >
                    <span className="absolute opacity-0 group-hover:opacity-100 transition:opacity duration-500 top-9">
                      {isPlaying ? "Pause" : "Play"}
                    </span>

                    {isPlaying ? (
                      <IoIosPause className="text-2xl" />
                    ) : (
                      <FaRegPlayCircle className="text-2xl" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center mt-5">
          <p>
            Click <span className="text-blue-500">Detect Mode</span> to get
            recommended tracks.
          </p>
        </div>
      )}
    </div>
  );
};

export default Songs;
