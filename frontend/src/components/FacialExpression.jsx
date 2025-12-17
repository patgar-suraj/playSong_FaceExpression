import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FacialExpression({ setmusic }) {
  const videoRef = useRef(null);
  const [_expression, set_expression] = useState("");

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
      console.log("No face detected!");
      set_expression(""); // optional
      return;
    }

    for (const expression of Object.keys(detections[0].expressions)) {
      if (detections[0].expressions[expression] > mostProableExpression) {
        mostProableExpression = detections[0].expressions[expression];
        mostExpression = expression;
      }
    }

    console.log(mostExpression);

    axios.get(`http://localhost:3000/song?mood=${mostExpression}`).then((response) => {
      setmusic(response.data.songs);
      console.log(response.data);
    });
  }

  // async function detectFace() {
  //   if (!videoRef.current) return;

  //   const detections = await faceapi
  //     .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
  //     .withFaceExpressions();
  //     let mostProableExpression = 0

  //   if (!detections || detections.length === 0) {
  //     console.log("No face detected!");
  //     set_expression(""); // optional
  //     return;
  //   }

  //   const expressions = detections[0].expressions;

  //   // Find highest probability expression
  //   let best = ["", 0];
  //   for (const key of Object.keys(expressions)) {
  //     if (expressions[key] > best[1]) {
  //       best = [key, expressions[key]];
  //     }
  //   }

  //   set_expression(best[0]);
  //   console.log("Detected:", best[0]);

  //   axios.get(`http://localhost:3000/song?mood=${best[0]}`)
  //   .then(response=>{
  //     setmusic(response.data.songs)
  //     console.log(response.data)
  //   })
  // }

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
          className="w-full h-92 rounded-4xl bg-white border-2 border-white object-cover"
        />

        <div className="w-full flex items-center justify-between">
          <button
            onClick={detectFace}
            className="bg-blue-600 py-2 px-4 rounded-full cursor-pointer text-white font-bold active:scale-[0.98] transition-all"
          >
            Detect Mode
          </button>

          <span className="bg-blue-600 py-2 px-4 rounded-full text-white font-bold">
            {_expression ? _expression.toUpperCase() : "Detecting..."}
          </span>
        </div>
      </div>
    </div>
  );
}
