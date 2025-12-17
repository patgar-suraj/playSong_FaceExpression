import { useState } from "react";
import FacialExpression from "./components/FacialExpression";
import Songs from "./components/Songs";

const App = () => {
  const [music, setmusic] = useState([]);

  return (
    <div className="w-screen h-screen gap-10 flex items-start justify-start p-10 bg-[#2b2b2b]">
      <FacialExpression setmusic={setmusic} />
      <Songs music={music} />
    </div>
  );
};

export default App;
