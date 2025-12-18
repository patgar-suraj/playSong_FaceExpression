import { useState } from "react";
import FacialExpression from "./components/FacialExpression";
import Songs from "./components/Songs";

const App = () => {
  const [music, setmusic] = useState([]);

  return (
    <div className="overflow-hidden  w-screen h-screen gap-10 flex flex-col lg:flex-row items-start justify-start p-3 md:p-10 bg-[#0F0F0F]">
      <FacialExpression setmusic={setmusic} />
      <Songs music={music} />
    </div>
  );
};

export default App;
