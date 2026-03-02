import { useState, useRef, useEffect } from 'react'
import { sendMessage } from './services/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const userMessage = { role: 'user', text: question };
    const currentQuestion = question;

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setError(null);

    try {
      // Map frontend messages to Gemini history format for the backend
      // [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const reply = await sendMessage(currentQuestion, history);

      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      if (err.message.includes('429')) {
        setError('Daily AI limit reached (Free Tier). Please try again later!');
      } else {
        setError(err.message || 'Failed to get response');
      }
      console.error('Chat Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex h-dvh w-full bg-zinc-900 overflow-hidden font-sans text-zinc-100'>
      {/* Sidebar - Desktop Only */}
      <aside className='w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800 hidden md:flex flex-col flex-shrink-0'>
        <div className='p-6 text-white font-bold text-xl tracking-tight flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs'>AI</div>
          <span>Chatbot</span>
        </div>
        <div className='px-4 flex-grow overflow-y-auto'>
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className='w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-all text-sm font-medium flex items-center justify-center gap-2 mb-4 group'
          >
            <span className='text-lg group-hover:scale-110 transition-transform'>+</span> New Chat
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className='flex-grow flex flex-col h-full overflow-hidden relative'>
        <div className='max-w-4xl mx-auto w-full flex-grow flex flex-col min-h-0 p-4 md:p-8 lg:p-10'>

          {/* Messages Container */}
          <div className='flex-grow overflow-y-auto mb-6 space-y-4 px-2 custom-scrollbar'>
            {messages.length === 0 && !loading && (
              <div className='h-full flex items-center justify-center'>
                <p className='text-zinc-500 italic text-lg'>Start a conversation...</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-tl-none'
                  }`}>
                  <p className='text-xs opacity-50 mb-1 font-semibold uppercase tracking-wider'>
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </p>
                  <div className='text-sm md:text-base whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none'>
                    {msg.role === 'model' ? (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className='flex justify-start'>
                <div className='bg-zinc-800 text-zinc-400 p-4 rounded-2xl rounded-tl-none border border-zinc-700 animate-pulse'>
                  AI is thinking...
                </div>
              </div>
            )}

            {error && (
              <div className='flex justify-center'>
                <div className='bg-red-900/20 text-red-400 px-4 py-2 rounded-lg border border-red-900/50 text-sm'>
                  ⚠️ {error}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className='bg-zinc-800 w-full p-1 pr-2 text-white rounded-2xl border border-zinc-700 focus-within:border-blue-500 transition-all flex h-16 items-center shadow-xl'>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              className='w-full h-full p-4 bg-transparent outline-none text-zinc-100 placeholder-zinc-500'
              placeholder={loading ? 'Waiting for response...' : 'Ask me anything... (max 2000 chars)'}
              disabled={loading}
              maxLength={2000}
            />
            <button
              onClick={askQuestion}
              disabled={loading || !question.trim()}
              className='bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all'
              title="Send Message"
            >
              {loading ? (
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
          <p className='text-center text-[10px] text-zinc-600 mt-2 font-medium tracking-wide'>
            Powered by Google Gemini AI
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
