import { useState } from "react";
import { FaRegPlayCircle } from "react-icons/fa";
import { IoIosPause } from "react-icons/io";


const Songs = () => {
  const [music, setmusic] = useState([
    {
      title: "title",
      artist: "artist",
      url: "url",
    },
    {
      title: "title",
      artist: "artist",
      url: "url",
    },
    {
      title: "title",
      artist: "artist",
      url: "url",
    },
  ]);

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <div className="w-full">
      <h1 className="font-bold text-2xl">Rcommended Tracks :</h1>

      {music.map((song, idx) => (
        <div key={idx} className="flex w-full gap-3 items-start justify-between">
          <div className="mt-5 p-2 border-t-2 border-r-2 border-l-2 rounded-xl border-[#2b2b2b] hover:bg-linear-to-b from-[#181818] to-transparent w-full">
            <h1 className="text-xl font-semibold">
              {capitalize(song.title)}
            </h1>
            <h4>{capitalize(song.artist)}</h4>
          </div>
          <div className="play-pause-btn cursor-pointer active:scale-[0.98] transition-all duration-100 ease-initial flex items-center justify-center mt-5 p-2 border-t-2 border-r-2 border-l-2 rounded-xl hover:bg-linear-to-b from-[#181818] to-transparent border-[#2b2b2b]">
            <FaRegPlayCircle className="text-2xl" />
            <IoIosPause className="text-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Songs;
