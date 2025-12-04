import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, AudioState, TranslationResult } from '../types';
import { INDIAN_LANGUAGES, VOICE_OPTIONS } from '../constants';
import { translateText, generateSpeech } from '../services/geminiService';
import { Play, Pause, RefreshCw, AlertTriangle, Stethoscope, FileText, CheckCircle, Mic, Shield } from 'lucide-react';

interface Props {
  data: AnalysisResult;
}

const AnalysisResults: React.FC<Props> = ({ data }) => {
  const [targetLang, setTargetLang] = useState<string>('en');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [translatedContent, setTranslatedContent] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    audioData: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTranslate = async () => {
    if (!targetLang) return;
    setIsTranslating(true);
    try {
      const textToTranslate = data.summary;
      const result = await translateText(textToTranslate, INDIAN_LANGUAGES.find(l => l.code === targetLang)?.name || 'English');
      setTranslatedContent({ language: targetLang, translatedText: result });
      
      // Reset audio when text changes because the audio needs to match the new text
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setAudioState({ isPlaying: false, isLoading: false, audioData: null });
    } catch (e) {
      alert("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
    // Reset audio when voice changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioState({ isPlaying: false, isLoading: false, audioData: null });
  };

  const handlePlayAudio = async () => {
    // If playing, pause it
    if (audioState.isPlaying && audioRef.current) {
      audioRef.current.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    // If we have audio data already, resume/play
    if (audioState.audioData) {
      if (!audioRef.current) {
        const audioSrc = `data:audio/mp3;base64,${audioState.audioData}`;
        audioRef.current = new Audio(audioSrc);
        audioRef.current.onended = () => setAudioState(prev => ({ ...prev, isPlaying: false }));
      }
      try {
        await audioRef.current.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      } catch (err) {
        console.error("Playback failed", err);
        alert("Autoplay blocked. Please click play again.");
      }
      return;
    }

    // Generate new audio
    setAudioState(prev => ({ ...prev, isLoading: true }));
    try {
      const textToRead = translatedContent ? translatedContent.translatedText : data.summary;
      // Using the service which emulates Coqui TTS via Gemini, with selected voice
      const base64Audio = await generateSpeech(textToRead, targetLang, selectedVoice);
      
      const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioSrc);
      
      audio.onended = () => setAudioState(prev => ({ ...prev, isPlaying: false }));
      
      audioRef.current = audio;
      await audio.play();
      
      setAudioState({ isPlaying: true, isLoading: false, audioData: base64Audio });
    } catch (e) {
      console.error(e);
      alert("Could not generate audio. Please try again.");
    } finally {
      setAudioState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const displayText = translatedContent ? translatedContent.translatedText : data.summary;
  const currentLangName = INDIAN_LANGUAGES.find(l => l.code === targetLang)?.name || 'English';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Header with Type Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${data.documentType === 'Consent Form' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
            {data.documentType === 'Consent Form' ? <Shield className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{data.documentType}</h2>
            <p className="text-sm text-gray-500">AI Analysis & Simplification</p>
          </div>
        </div>

        {/* Translation Controls */}
        <div className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
           <span className="text-xs font-semibold text-gray-400 uppercase mr-3 pl-2">Translate to:</span>
           <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none min-w-[120px]"
           >
             {INDIAN_LANGUAGES.map(lang => (
               <option key={lang.code} value={lang.code}>{lang.name}</option>
             ))}
           </select>
           <button 
            onClick={handleTranslate}
            disabled={isTranslating}
            className="ml-2 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-md transition-colors"
            title="Translate Text"
           >
             {isTranslating ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Go"}
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Summary & Audio */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <FileText className="w-24 h-24 text-teal-600" />
             </div>
             
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center text-lg">
                  <span className="mr-2">📝</span> Simplified Summary ({currentLangName})
                </h3>
                {translatedContent && (
                  <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">Translated</span>
                )}
             </div>

             <div className="prose prose-teal max-w-none text-gray-700 leading-relaxed text-lg">
               {displayText}
             </div>

             {/* Audio Player Controls */}
             <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handlePlayAudio}
                      className="flex items-center space-x-3 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {audioState.isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : audioState.isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      <span className="font-semibold">{audioState.isPlaying ? "Pause Voice" : "Listen (AI Voice)"}</span>
                    </button>
                    {audioState.isPlaying && (
                      <div className="flex space-x-1 items-end h-6">
                         <div className="w-1 bg-teal-400 h-2 animate-pulse"></div>
                         <div className="w-1 bg-teal-400 h-4 animate-pulse delay-75"></div>
                         <div className="w-1 bg-teal-400 h-6 animate-pulse delay-150"></div>
                         <div className="w-1 bg-teal-400 h-3 animate-pulse delay-100"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Voice Selector */}
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Mic className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedVoice}
                      onChange={handleVoiceChange}
                      className="bg-transparent text-sm text-gray-700 outline-none border-none cursor-pointer"
                    >
                      {VOICE_OPTIONS.map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-right mt-2">
                   <span className="text-xs text-gray-400">Powered by Gemini TTS</span>
                </div>
             </div>
          </div>

          {/* Consent Analysis (Only shows if it IS a consent form) */}
          {data.documentType === 'Consent Form' && data.consentAnalysis && (
            <div className="bg-orange-50 rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
              <div className="bg-orange-100/50 p-4 border-b border-orange-100 flex items-center justify-between">
                <h3 className="font-bold text-orange-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" /> Consent Analysis
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  data.consentAnalysis.complexityScore > 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Complexity: {data.consentAnalysis.complexityScore}/10
                </span>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Risks Section */}
                 <div>
                    <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-3">Potential Risks & Red Flags</h4>
                    <ul className="space-y-2">
                      {data.consentAnalysis.risks.map((risk, i) => (
                        <li key={i} className="flex items-start text-orange-900/80 text-sm">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                 </div>

                 {/* Suggestion Box */}
                 <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                   <div className="text-sm font-bold text-gray-700 mb-1">💡 ArogyaVani Suggestion:</div>
                   <p className="text-gray-600 text-sm leading-relaxed">{data.consentAnalysis.suggestion}</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Specialist Recommendations */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-50 h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            
            <h3 className="font-bold text-gray-800 mb-6 flex items-center">
              <Stethoscope className="w-6 h-6 mr-2 text-blue-500" />
              <span>Specialist Opinion</span>
            </h3>

            <div className="space-y-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Recommended for this case</div>
              
              {data.doctorRecommendations.map((rec, idx) => (
                <div key={idx} className="group bg-slate-50 hover:bg-blue-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-800">{rec.specialty}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      rec.urgency === 'Immediate' ? 'bg-red-100 text-red-600' : 
                      rec.urgency === 'Urgent' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{rec.reason}</p>
                  
                  <button className="w-full py-2 text-xs font-semibold bg-white text-blue-600 border border-blue-200 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Find {rec.specialty} Nearby
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                AI recommendations are supportive, not diagnostic. Always consult a general physician first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
