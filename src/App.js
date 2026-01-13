import React, { useState, useEffect } from 'react';

const VIBES = {
  focused: { emoji: '🎯', label: 'focused' },
  tired: { emoji: '😮‍💨', label: 'tired' },
  calm: { emoji: '😌', label: 'calm' },
  interesting: { emoji: '🤔', label: 'interesting' },
  fun: { emoji: '😊', label: 'fun' },
  challenging: { emoji: '💪', label: 'challenging' },
  confusing: { emoji: '🤯', label: 'confusing' },
  frustrated: { emoji: '😤', label: 'frustrated' }
};

export default function StudyTracker() {
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [hasName, setHasName] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  
  // Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSubject, setCurrentSubject] = useState('');
  const [showVibeSelector, setShowVibeSelector] = useState(false);
  
  // Cards open state
  const [openCard, setOpenCard] = useState(null);
  
  // Data
  const [todos, setTodos] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [oneLine, setOneLine] = useState('');

  useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    loadData();
    // [사파리 로고 해결] 브라우저가 강제로 새 아이콘을 읽게 파라미터 추가
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = `${process.env.PUBLIC_URL}/favicon.ico?v=${Date.now()}`;
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  const loadData = () => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
      setHasName(true);
    }
    
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) setTodos(JSON.parse(storedTodos));
    
    const storedSessions = localStorage.getItem('sessions');
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    
    const storedOneLine = localStorage.getItem('oneLine');
    if (storedOneLine) {
      const data = JSON.parse(storedOneLine);
      if (isToday(data.date)) {
        setOneLine(data.text);
      }
    }
  };

  const isToday = (timestamp) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return new Date(timestamp).setHours(0, 0, 0, 0) === today;
  };

  const saveName = () => {
    if (!userName.trim()) return;
    localStorage.setItem('userName', userName.trim());
    setHasName(true);
  };

  const saveTodos = (newTodos) => {
    localStorage.setItem('todos', JSON.stringify(newTodos));
    setTodos(newTodos);
  };

  const saveSessions = (newSessions) => {
    localStorage.setItem('sessions', JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const saveOneLine = (text) => {
    const data = { text: text.trim(), date: Date.now() };
    localStorage.setItem('oneLine', JSON.stringify(data));
    setOneLine(text.trim());
  };

  const addTodo = (subject) => {
    if (!subject.trim()) return;
    saveTodos([...todos, { id: Date.now().toString(), subject: subject.trim(), checked: false }]);
  };

  const toggleTodo = (id) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const deleteTodo = (id) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const startTimer = () => {
    if (!currentSubject.trim()) return;
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsTimerRunning(true);
    setShowVibeSelector(false);
    setOpenCard(null);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setShowVibeSelector(true);
  };

  const saveSession = (vibes) => {
    if (!startTime || vibes.length === 0) return;

    const duration = Math.floor((Date.now() - startTime) / 60000);
    const newSession = {
      id: Date.now().toString(),
      date: Date.now(),
      subject: currentSubject,
      vibes: vibes,
      duration: duration
    };

    saveSessions([newSession, ...sessions]);
    setIsTimerRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentSubject('');
    setShowVibeSelector(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRandomMessage = () => {
    const messages = ["Just show up", "One step at a time", "You're here, that's enough", "No rush, just flow", "Today is today", "Keep it simple", "Be kind to yourself", "Progress, not perfection", "Small moves matter", "Trust the process"];
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return messages[seed % messages.length];
  };

  const bgClass = darkMode ? 'bg-black text-white' : 'bg-white text-black';

  if (!hasName) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <div className="max-w-md w-full space-y-6">
          <input
            type="text"
            placeholder="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveName()}
            className={`w-full p-4 border ${darkMode ? 'border-white bg-black text-white' : 'border-gray-300 bg-white text-black'} text-center text-lg`}
            autoFocus
          />
          <button
            onClick={saveName}
            className={`w-full p-4 border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            Start
          </button>
          {/* 사파리 강제 초기화용 비밀 버튼 (개발시에만 사용) */}
          <button 
            onClick={() => {localStorage.clear(); window.location.reload();}}
            className="w-full text-[10px] opacity-10"
          >
            reset storage
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'records') {
    return <RecordsView sessions={sessions} oneLine={oneLine} vibes={VIBES} onBack={() => setCurrentView('main')} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0 mr-4">
            <h1 className="text-4xl font-bold mb-2 break-all">{userName}</h1>
            <p className="text-lg opacity-70 truncate">{getRandomMessage()}</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="text-2xl flex-shrink-0">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {!isTimerRunning && !showVibeSelector && (
          <div className={`border ${darkMode ? 'border-white' : 'border-gray-300'} p-6 sm:p-8`}>
            {/* [수정] 타이머 시작 부분: flex-shrink-0와 min-w-0로 겹침 방지 */}
            <div className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="Study area"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startTimer()}
                className={`flex-1 min-w-0 p-3 border ${darkMode ? 'border-white bg-black text-white' : 'border-gray-300 bg-white text-black'}`}
              />
              <button
                onClick={startTimer}
                disabled={!currentSubject.trim()}
                className={`px-6 sm:px-8 flex-shrink-0 border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-30`}
              >
                Start
              </button>
            </div>
          </div>
        )}

        {isTimerRunning && (
          <div className={`border ${darkMode ? 'border-white' : 'border-gray-300'} p-8`}>
            <div className="text-center mb-6">
              <div className="text-5xl sm:text-6xl font-mono mb-6">{formatTime(elapsedTime)}</div>
            </div>
            <button
              onClick={stopTimer}
              className={`w-full p-3 border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              Stop
            </button>
          </div>
        )}

        {showVibeSelector && (
          <div className={`border ${darkMode ? 'border-white' : 'border-gray-300'} p-4 sm:p-8`}>
            <VibeSelector onSelect={saveSession} darkMode={darkMode} />
          </div>
        )}

        {!isTimerRunning && !showVibeSelector && (
          <>
            <Card
              title="Todo"
              isOpen={openCard === 'todo'}
              onToggle={() => setOpenCard(openCard === 'todo' ? null : 'todo')}
              darkMode={darkMode}
            >
              <TodoCard
                todos={todos}
                onAdd={addTodo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                darkMode={darkMode}
              />
            </Card>

            <Card
              title="One line"
              isOpen={openCard === 'oneline'}
              onToggle={() => setOpenCard(openCard === 'oneline' ? null : 'oneline')}
              darkMode={darkMode}
            >
              <OneLineCard
                value={oneLine}
                onSave={saveOneLine}
                darkMode={darkMode}
              />
            </Card>

            <button
              onClick={() => setCurrentView('records')}
              className={`w-full border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'} p-8 text-left`}
            >
              <h2 className="text-3xl font-bold">Records</h2>
            </button>

            <div className="text-center py-8 text-sm opacity-50">
              <p>© 2025 partcircle. All rights reserved.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, isOpen, onToggle, darkMode, children }) {
  return (
    <div className={`border ${darkMode ? 'border-white' : 'border-gray-300'}`}>
      <button onClick={onToggle} className="w-full p-6 sm:p-8 text-left">
        <h2 className="text-3xl font-bold">{title}</h2>
      </button>
      {isOpen && <div className="p-6 sm:p-8 pt-0">{children}</div>}
    </div>
  );
}

function TodoCard({ todos, onAdd, onToggle, onDelete, darkMode }) {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      onAdd(newTodo);
      setNewTodo('');
    }
  };

  return (
    <div className="space-y-4">
      {/* [수정] Todo 입력 부분: flex-shrink-0와 min-w-0 적용 */}
      <div className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="Subject"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          className={`flex-1 min-w-0 p-2 border ${darkMode ? 'border-white bg-black text-white' : 'border-gray-300 bg-white text-black'}`}
        />
        <button
          onClick={handleAdd}
          className={`px-5 sm:px-6 flex-shrink-0 border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          +
        </button>
      </div>
      
      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={todo.checked}
              onChange={() => onToggle(todo.id)}
              className="w-5 h-5 flex-shrink-0"
            />
            <span className={`flex-1 text-lg break-all ${todo.checked ? 'line-through opacity-50' : ''}`}>
              {todo.subject}
            </span>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 text-xl opacity-50 hover:opacity-100 flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OneLineCard({ value, onSave, darkMode }) {
  const [tempValue, setTempValue] = useState('');

  const handleSave = () => {
    if (tempValue.trim()) {
      onSave(tempValue);
      setTempValue('');
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="How was today?"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        className={`w-full p-3 border ${darkMode ? 'border-white bg-black text-white' : 'border-gray-300 bg-white text-black'}`}
      />
      <button
        onClick={handleSave}
        disabled={!tempValue.trim()}
        className={`w-full p-2 border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-30`}
      >
        Save
      </button>
    </div>
  );
}

function VibeSelector({ onSelect, darkMode }) {
  const [selectedVibes, setSelectedVibes] = useState([]);

  const toggleVibe = (key) => {
    setSelectedVibes(prev =>
      prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-4">
      {/* [수정] 모바일에서 4열이 너무 좁을 수 있어 grid-cols-4 유지하되 p-2로 간격 조절 */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(VIBES).map(([key, vibe]) => (
          <button
            key={key}
            onClick={() => toggleVibe(key)}
            className={`p-2 sm:p-4 border ${darkMode ? 'border-white' : 'border-gray-300'} ${
              selectedVibes.includes(key) ? darkMode ? 'bg-gray-800' : 'bg-gray-200' : ''
            }`}
          >
            <div className="text-xl sm:text-2xl mb-1">{vibe.emoji}</div>
            <div className="text-[10px] sm:text-xs truncate">{vibe.label}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => selectedVibes.length > 0 && onSelect(selectedVibes)}
        disabled={selectedVibes.length === 0}
        className={`w-full p-3 border ${darkMode ? 'border-white hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-30`}
      >
        Save
      </button>
    </div>
  );
}

function RecordsView({ sessions, oneLine, vibes, onBack, darkMode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getWeekDates = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(s => {
      const sDate = new Date(s.date);
      return sDate.toDateString() === date.toDateString();
    });
  };

  const getOneLineForDate = (date) => {
    const storedOneLine = localStorage.getItem('oneLine');
    if (!storedOneLine) return '';
    
    const data = JSON.parse(storedOneLine);
    const oneLineDate = new Date(data.date).toDateString();
    const targetDate = date.toDateString();
    
    return oneLineDate === targetDate ? data.text : '';
  };

  const weekDates = getWeekDates(selectedDate);
  const bgClass = darkMode ? 'bg-black text-white' : 'bg-white text-black';
  const selectedOneLine = getOneLineForDate(selectedDate);

  return (
    <div className={`min-h-screen ${bgClass} p-4 sm:p-6`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={onBack} className="text-2xl">← Back</button>
        
        <h1 className="text-4xl font-bold">Records</h1>

        <div className="text-2xl">
          {selectedDate.getFullYear()} / {selectedDate.toLocaleDateString('en-US', { month: 'short' })}
        </div>

        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 no-scrollbar">
          {weekDates.map(date => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-16 sm:w-20 p-3 sm:p-4 border ${darkMode ? 'border-white' : 'border-gray-300'} text-center ${
                date.toDateString() === selectedDate.toDateString() ? darkMode ? 'bg-gray-800' : 'bg-gray-200' : ''
              }`}
            >
              <div className="text-xs sm:text-sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-xl sm:text-2xl font-bold">{date.getDate()}</div>
            </button>
          ))}
        </div>

        <div className={`border ${darkMode ? 'border-white' : 'border-gray-300'} p-6 sm:p-8 space-y-4`}>
          {getSessionsForDate(selectedDate).map(session => (
            <div key={session.id} className={`border-b ${darkMode ? 'border-white' : 'border-gray-300'} pb-4 last:border-0`}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xl font-bold break-all">{session.subject}</div>
                <div className="text-gray-500 flex-shrink-0 ml-2">{session.duration}m</div>
              </div>
              <div className="text-2xl">
                {session.vibes.map(v => vibes[v] ? vibes[v].emoji : '').filter(Boolean).join(' ')}
              </div>
            </div>
          ))}
          
          {getSessionsForDate(selectedDate).length === 0 && (
            <div className="text-gray-400 text-center py-8">No sessions</div>
          )}

          {selectedOneLine && (
            <div className={`pt-4 border-t ${darkMode ? 'border-white' : 'border-gray-300'}`}>
              <div className="text-sm text-gray-500 mb-2">One line</div>
              <div className="text-lg">{selectedOneLine}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}