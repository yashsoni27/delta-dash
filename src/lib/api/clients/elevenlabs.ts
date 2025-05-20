import { ElevenLabsClient } from "elevenlabs";

export class ElevenLabsApiClient {
  private client: ElevenLabsClient;

  constructor(apiKey: string) {
    this.client = new ElevenLabsClient({
      apiKey: apiKey
    });
  }

  async transcribe(audioBlob: Blob) {
    try {
      return await this.client.speechToText.convert({
        file: audioBlob,
        model_id: "scribe_v1",
        tag_audio_events: true,
        language_code: "eng",
        diarize: true,
      });
    } catch (e) {
      console.log("Error in ElevenLabs transcription: ", e);
      throw e;
    }
  }
}