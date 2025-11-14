'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Quiz, QuizAttempt } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';

interface QuizAnswer {
  question_id: number;
  selected_answer?: string;
  answer_text?: string;
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.id as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await api.getQuiz(quizId);
      setQuiz(data);
      setTimeStarted(new Date());
      
      // Initialize answers object
      const initialAnswers: Record<number, QuizAnswer> = {};
      data.questions.forEach(q => {
        initialAnswers[q.id] = { question_id: q.id };
      });
      setAnswers(initialAnswers);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load quiz');
      router.push('/dashboard/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string, type: 'mcq' | 'true_false' | 'short_answer') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        ...(type === 'short_answer' 
          ? { answer_text: value }
          : { selected_answer: value }
        )
      }
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = quiz?.questions.filter(q => {
      const answer = answers[q.id];
      return !answer?.selected_answer && !answer?.answer_text;
    });

    if (unanswered && unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    try {
      setSubmitting(true);
      const attemptData = await api.submitQuizAttempt(quizId, {
        answers: Object.values(answers)
      });
      
      setAttempt(attemptData);
      toast.success('Quiz submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  // Show results if attempt exists
  if (attempt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 mb-6">{quiz.title}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(attempt.score)}`}>
                {attempt.score.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
              <p className="text-3xl font-bold text-gray-900">
                {attempt.correct_answers}/{attempt.total_questions}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Time Taken</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((new Date(attempt.completed_at).getTime() - new Date(attempt.started_at).getTime()) / 60000)} min
              </p>
            </div>
          </div>

          {attempt.feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">AI Feedback</h3>
              <p className="text-blue-800 whitespace-pre-wrap">{attempt.feedback}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/dashboard/quizzes')}>
              Back to Quizzes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setAttempt(null);
                setTimeStarted(new Date());
                const initialAnswers: Record<number, QuizAnswer> = {};
                quiz.questions.forEach(q => {
                  initialAnswers[q.id] = { question_id: q.id };
                });
                setAnswers(initialAnswers);
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </Card>

        {/* Review Answers */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Answer Review</h2>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find(a => a.question_id === question.id);
              const isCorrect = userAnswer?.is_correct;
              
              return (
                <div key={question.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2">
                        {index + 1}. {question.question_text}
                      </p>
                      
                      {question.question_type === 'mcq' && (
                        <div className="space-y-2">
                          {question.options?.map((option, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                option === question.correct_answer
                                  ? 'bg-green-100 border-2 border-green-500'
                                  : option === userAnswer?.selected_answer
                                  ? 'bg-red-100 border-2 border-red-500'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {option}
                              {option === question.correct_answer && (
                                <span className="ml-2 text-green-700 font-semibold">(Correct)</span>
                              )}
                              {option === userAnswer?.selected_answer && option !== question.correct_answer && (
                                <span className="ml-2 text-red-700 font-semibold">(Your answer)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.question_type === 'true_false' && (
                        <div className="space-y-2">
                          <div className={`p-3 rounded-lg ${
                            question.correct_answer === 'True'
                              ? 'bg-green-100 border-2 border-green-500'
                              : userAnswer?.selected_answer === 'True'
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-gray-50'
                          }`}>
                            True
                            {question.correct_answer === 'True' && (
                              <span className="ml-2 text-green-700 font-semibold">(Correct)</span>
                            )}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            question.correct_answer === 'False'
                              ? 'bg-green-100 border-2 border-green-500'
                              : userAnswer?.selected_answer === 'False'
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-gray-50'
                          }`}>
                            False
                            {question.correct_answer === 'False' && (
                              <span className="ml-2 text-green-700 font-semibold">(Correct)</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {question.question_type === 'short_answer' && (
                        <div className="space-y-2">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                            <p className="font-medium">{userAnswer?.answer_text || 'No answer provided'}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                            <p className="font-medium">{question.correct_answer}</p>
                          </div>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Explanation: </span>
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.topic && (
              <p className="text-gray-600 mt-1">Topic: {quiz.topic}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{quiz.questions.length} Questions</span>
          </div>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="border-b pb-6 last:border-b-0">
              <p className="font-semibold mb-4">
                {index + 1}. {question.question_text}
              </p>

              {question.question_type === 'mcq' && (
                <div className="space-y-2">
                  {question.options?.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      style={{
                        borderColor: answers[question.id]?.selected_answer === option ? '#3b82f6' : '#e5e7eb'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id]?.selected_answer === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value, 'mcq')}
                        className="w-4 h-4 text-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'true_false' && (
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{
                      borderColor: answers[question.id]?.selected_answer === 'True' ? '#3b82f6' : '#e5e7eb'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="True"
                      checked={answers[question.id]?.selected_answer === 'True'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value, 'true_false')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>True</span>
                  </label>
                  <label
                    className="flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{
                      borderColor: answers[question.id]?.selected_answer === 'False' ? '#3b82f6' : '#e5e7eb'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="False"
                      checked={answers[question.id]?.selected_answer === 'False'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value, 'true_false')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>False</span>
                  </label>
                </div>
              )}

              {question.question_type === 'short_answer' && (
                <textarea
                  value={answers[question.id]?.answer_text || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value, 'short_answer')}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-primary min-h-[100px]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-end mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/quizzes')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
