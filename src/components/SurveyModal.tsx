import React, { useState } from 'react';
import { Survey } from '../types';
import { ClipboardCheck, X, Star, CheckCircle } from 'lucide-react';

interface SurveyModalProps {
  survey: Survey;
  onClose: () => void;
  onSubmit: (surveyId: string, answers: Record<string, string | number>) => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ survey, onClose, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const handleOptionChange = (questionId: string, val: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(survey.id, answers);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Sondage Programmé
              </span>
              <h3 className="text-base font-black text-slate-800">{survey.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">{survey.description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {survey.questions.map((q, idx) => (
            <div key={q.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-extrabold text-slate-800">
                {idx + 1}. {q.questionText}
              </label>

              {/* Multiple Choice */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-1.5 pt-1">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                        answers[q.id] === opt
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleOptionChange(q.id, opt)}
                        className="accent-indigo-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Rating 1-5 */}
              {q.type === 'rating' && (
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleOptionChange(q.id, star)}
                      className={`p-2 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        answers[q.id] === star
                          ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 mr-1 ${answers[q.id] === star ? 'fill-slate-900' : ''}`} />
                      {star}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input */}
              {q.type === 'text' && (
                <textarea
                  rows={2}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => handleOptionChange(q.id, e.target.value)}
                  placeholder="Écrivez votre réponse ici..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
                ></textarea>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Envoyer les réponses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
