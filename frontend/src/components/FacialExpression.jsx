import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FacialExpression({ setmusic }) {
  const videoRef = useRef(null);
  const [_expression, set_expression] = useState("");
  const [noFaceDetect, setNoFaceDetect] = useState("");

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  async function detectFace() {
    if (!videoRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    let mostProableExpression = 0;
    let mostExpression = "";

    if (!detections || detections.length === 0) {
      setNoFaceDetect("No face detected!")
      console.log("No face detected!");
      set_expression(""); // optional
      return;
    }

    for (const expression of Object.keys(detections[0].expressions)) {
      if (detections[0].expressions[expression] > mostProableExpression) {
        mostProableExpression = detections[0].expressions[expression];
        mostExpression = expression;
        set_expression(mostExpression)
        console.log(mostExpression);
      }
    }

    axios
      .get(`http://localhost:3000/song?mood=${mostExpression}`)
      .then((response) => {
        setmusic(response.data.songs);
      });
  }

  useEffect(() => {
    loadModels().then(startVideo);
  }, []);

  return (
    <div className="w-full flex items-start justify-start gap-20">
      <div className="w-full flex flex-col gap-10">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-1/2 md:h-96 lg:h-1/2 rounded-xl border-b-2 border-[#404040] object-cover"
        />

        <div className="w-full flex items-center justify-center gap-10">
          <button
            onClick={detectFace}
            className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg cursor-pointer text-white font-bold active:scale-[0.98] transition-all"
          >
            Detect Mode
          </button>

          <span className="bg-blue-700 py-2 px-4 rounded-lg text-white font-semibold">
            {_expression ? _expression.charAt(0).toUpperCase()+_expression.slice(1).toLocaleLowerCase() : noFaceDetect}
          </span>
        </div>
      </div>
    </div>
  );
}
