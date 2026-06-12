const elevenlabs = require("./index");

async function main() {
  elevenlabs.setApiKey(process.env.ELEVENLABS_API_KEY);

  console.log("=== ElevenLabs JS Demo ===\n");

  const user = await elevenlabs.getUser();
  console.log("User tier:", user?.subscription?.tier);

  const sub = await elevenlabs.getUserSubscription();
  console.log(
    "Characters:",
    `${sub?.character_count}/${sub?.character_limit}`
  );

  const models = await elevenlabs.getModels();
  console.log("\nModels:");
  models.forEach((m) => console.log(` - ${m.model_id} (${m.name})`));

  const voices = await elevenlabs.getVoices();
  console.log("\nVoices:");
  voices.slice(0, 8).forEach((v) => console.log(` - ${v.name} (${v.voice_id})`));

  const firstVoice = voices[0];
  console.log("\nTrying text-to-speech with voice:", firstVoice.name);
  try {
    const audio = await elevenlabs.textToSpeech(
      firstVoice.voice_id,
      "Hello from elevenlabs-js!"
    );
    await audio.saveFile("output.mp3");
    console.log("Audio saved to output.mp3");
  } catch (err) {
    const detail = err?.response?.data?.detail || err.message;
    console.log("text-to-speech failed:", JSON.stringify(detail));
  }
}

main().catch((e) => console.error("Fatal:", e.message));
