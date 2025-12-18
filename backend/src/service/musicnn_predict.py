#!/usr/bin/env python3
import sys
import json
import os

# Try to use musicnn if available; otherwise use a simple librosa-based heuristic
try:
    import musicnn
    from musicnn import musicnn_prediction
    HAS_MUSICNN = True
except Exception as e:
    HAS_MUSICNN = False

try:
    import librosa
    import numpy as np
except Exception as e:
    print(json.dumps({"error": "Missing python dependencies. Run `pip install -r requirements.txt`"}))
    sys.exit(1)


def heuristic_mood(filepath):
    try:
        y, sr = librosa.load(filepath, sr=22050, mono=True, duration=60)

        tempo_arr = librosa.beat.tempo(y=y, sr=sr)
        tempo = float(tempo_arr[0]) if len(tempo_arr) > 0 else 0.0
        rms = float(np.mean(librosa.feature.rms(y=y)))
        centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))

        # Heuristic rules (tweak thresholds if needed)
        if tempo >= 120 and rms > 0.02:
            return "happy"
        if tempo >= 110 and rms > 0.015:
            return "energetic"
        if tempo <= 75 and rms < 0.01:
            return "sad"
        if rms > 0.04:
            return "angry"
        if centroid > 3500:
            return "surprised"
        if tempo < 90 and rms < 0.02:
            return "calm"

        return "neutral"
    except Exception as e:
        # in case of any audio processing error, return neutral and include error in stderr
        print(json.dumps({"error": f"heuristic failed: {str(e)}"}))
        return "neutral"



def musicnn_mood(filepath):
    if not HAS_MUSICNN:
        return None
    try:
        # import inside function so module import is optional
        from musicnn.tagger import MusicnnTagger

        tagger = MusicnnTagger(
            model='MTT_musicnn',
            input_length=3,
            batch_size=1
        )

        tags, probabilities = tagger.predict(filepath)
        probs = probabilities.mean(axis=0)
        top_tag = tags[np.argmax(probs)].lower()

        # Map tags to moods
        if any(x in top_tag for x in ["happy", "joy", "fun", "upbeat"]):
            return "happy"
        if any(x in top_tag for x in ["sad", "melancholy"]):
            return "sad"
        if any(x in top_tag for x in ["angry", "aggressive", "hard"]):
            return "angry"
        if any(x in top_tag for x in ["calm", "ambient", "relax"]):
            return "calm"
        if any(x in top_tag for x in ["dance", "party", "energetic"]):
            return "energetic"

        return None
    except Exception as e:
        # don't crash, just return None so heuristic will be used
        print(json.dumps({"error": f"musicnn failed: {str(e)}"}))
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file path provided"}))
        sys.exit(1)

    filepath = sys.argv[1]

    if not os.path.exists(filepath):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    mood = None

    # Try musicnn first if available
    if HAS_MUSICNN:
        try:
            mood = musicnn_mood(filepath)
        except Exception as e:
            print(json.dumps({"error": f"musicnn invocation failed: {str(e)}"}))
            mood = None

    # Fallback heuristic
    if mood is None:
        mood = heuristic_mood(filepath)

    print(json.dumps({"mood": mood}))
