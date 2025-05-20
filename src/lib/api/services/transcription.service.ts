import { ElevenLabsApiClient } from "../clients/elevenlabs";

export class TranscriptionService {
  constructor(private elevenLabsClient: ElevenLabsApiClient) {}

  async transcribeAudio(audioUrl: string) {
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(audioUrl)}`);
      const audioBlob = await response.blob();
      
      return await this.elevenLabsClient.transcribe(audioBlob);
    } catch (e) {
      console.log("Error in transcription service: ", e);
      throw e;
    }
  }
}