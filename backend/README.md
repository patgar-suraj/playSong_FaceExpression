# Backend - Music Mood Detection

This backend has an automatic mood detection flow for uploaded songs using `musicnn` (if available) or a simple fallback heuristic based on `librosa`.

## Setup

1. Install Node dependencies:

   npm install

2. Install Python dependencies (requires Python >= 3.8):

   python -m pip install -r requirements.txt

   - `musicnn` is optional but recommended. If it's not available, the server will fall back to a simple `librosa`-based heuristic.

3. Ensure `ffmpeg` is installed on your system (used for audio decoding by `librosa` in some setups).

## How it works

- When you POST `/song` with an `audio` file (multipart form), the server:
  1. Uploads the file to ImageKit (same as before).
  2. Writes the uploaded buffer to a temporary file and calls `musicnn_predict.py` to get a predicted `mood`.
  3. Saves the song in the DB with `mood` set to the detected mood (or the provided `mood` if detection fails).

## Notes

- The detector will return one of: `happy`, `sad`, `neutral`, `angry`, `surprised`, `calm`, `energetic` (or close variants). The frontend maps face expressions to these moods.
- If you want to rely only on `musicnn` advanced tagging, install it via `pip` and ensure versions are compatible.
