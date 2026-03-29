import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const VoiceRecorder = ({ onTranscript, className = "" }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    let fullTranscript = "";

    recognition.onresult = (event: any) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullTranscript += transcript + " ";
          onTranscript(fullTranscript.trim());
        } else {
          interimText += transcript;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        toast.error("Voice recognition error: " + event.error);
      }
      setIsRecording(false);
      setInterim("");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success("Recording started — speak now");
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterim("");
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        className="gap-1.5"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <>
            <MicOff size={14} />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground" />
            </span>
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={14} /> Voice Record
          </>
        )}
      </Button>
      {isRecording && interim && (
        <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
          {interim}...
        </span>
      )}
    </div>
  );
};

export default VoiceRecorder;
