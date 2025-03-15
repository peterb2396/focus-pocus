import React, { useState, useEffect, useCallback } from 'react';
import { Check, Plus, Edit, Trash2, ArrowRight, List, Target, X } from 'lucide-react';
import Confetti from 'react-confetti';

const Main = () => {
  // States
  const [todos, setTodos] = useState([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [incompleteTasksIndices, setIncompleteTasksIndices] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'focus'
  const [isExploding, setIsExploding] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  
useEffect(() => {
  // Find indices of all incomplete tasks
  const newIncompleteIndices = todos
    .map((todo, index) => todo.completed ? -1 : index)
    .filter(index => index !== -1);
  
  setIncompleteTasksIndices(newIncompleteIndices);
  
  // Set current task to first incomplete task when view changes to focus
  if (view === 'focus' && newIncompleteIndices.length > 0) {
    setCurrentTask(newIncompleteIndices[0]);
  }
}, [todos, view]);

const handleClearAllTasks = useCallback(() => {
  setTodos([]);
  setShowClearConfirm(false);
}, []);
  
  // Apply global styles
  useEffect(() => {
    document.body.style.background = '#f2f2f2';
    document.body.style.margin = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
   
  }, []);
  
  // Load todos from localStorage on component mount
  useEffect(() => {
    const storedTodos = localStorage.getItem('focusTodos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);
  
  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('focusTodos', JSON.stringify(todos));
  }, [todos]);
  
  // Handle adding a new todo
  const handleAddTodo = useCallback(() => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo,
        completed: false
      };
      setTodos(prevTodos => [...prevTodos, newTodoItem]);
      setNewTodo('');
    }
  }, [newTodo]);
  
  // Handle deleting a todo
  const handleDeleteTodo = useCallback((id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    // Adjust currentTask if needed
    setCurrentTask(current => {
      if (current >= todos.length - 1) {
        return Math.max(0, todos.length - 2);
      }
      return current;
    });
  }, [todos.length]);
  
  // Handle toggling the completed status of a todo
  const handleToggleComplete = useCallback((id) => {
    const todoToToggle = todos.find(todo => todo.id === id);
    
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    
    // Show confetti in focus view when marking as complete
    if (view === 'focus' && !todoToToggle.completed) {
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 5000);
    }
  }, [todos, view]);
  
  // Handle editing a todo
  const handleEditTodo = useCallback((id) => {
    const todoToEdit = todos.find(todo => todo.id === id);
    setEditingId(id);
    setEditText(todoToEdit.text);
  }, [todos]);
  
  // Handle saving an edited todo
  const handleSaveEdit = useCallback(() => {
    if (editText.trim()) {
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === editingId ? { ...todo, text: editText } : todo
        )
      );
      setEditingId(null);
      setEditText('');
    }
  }, [editingId, editText]);
  
  // ehandleNextTask function to cycle through incomplete tasks
const handleNextTask = useCallback(() => {
  if (incompleteTasksIndices.length === 0) return;
  
  const currentIndex = incompleteTasksIndices.indexOf(currentTask);
  if (currentIndex === -1 || currentIndex === incompleteTasksIndices.length - 1) {
    // If current task is not in incomplete list or is the last one, go to first incomplete
    setCurrentTask(incompleteTasksIndices[0]);
  } else {
    // Move to next incomplete task
    setCurrentTask(incompleteTasksIndices[currentIndex + 1]);
  }
}, [currentTask, incompleteTasksIndices]);

// handling previous task
const handlePreviousTask = useCallback(() => {
  if (incompleteTasksIndices.length === 0) return;
  
  const currentIndex = incompleteTasksIndices.indexOf(currentTask);
  if (currentIndex === -1 || currentIndex === 0) {
    // If current task is not in incomplete list or is the first one, go to last incomplete
    setCurrentTask(incompleteTasksIndices[incompleteTasksIndices.length - 1]);
  } else {
    // Move to previous incomplete task
    setCurrentTask(incompleteTasksIndices[currentIndex - 1]);
  }
}, [currentTask, incompleteTasksIndices]);
  
  
 //focus view - one task at a time 
const renderFocusView = () => {
  if (todos.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '16rem',
        textAlign: 'center'
      }}>
        <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
          <Target size={64} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>No tasks to focus on</h2>
        <button 
          onClick={() => setView('list')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <List size={16} style={{ marginRight: '0.5rem' }} />
          Go to list view
        </button>
      </div>
    );
  }

  // Check if there are incomplete tasks
  if (incompleteTasksIndices.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)'
      }}>
        <div style={{ color: '#10b981', marginBottom: '1rem' }}>
          <Check size={64} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>All tasks completed!</h2>
        <button 
          onClick={() => setView('list')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <List size={16} style={{ marginRight: '0.5rem' }} />
          Go to list view
        </button>
      </div>
    );
  }
  
  const todo = todos[currentTask];
  const currentIncompleteIndex = incompleteTasksIndices.indexOf(currentTask);
  const isFirstTask = currentIncompleteIndex === 0;
  const isLastTask = currentIncompleteIndex === incompleteTasksIndices.length - 1;
  
  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      width: '100vw', 
      background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)'
    }}>
      
      
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem'
      }}>
        <button 
          onClick={() => setView('list')}
          style={{
            backgroundColor: 'white',
            color: '#374151',
            padding: '0.5rem',
            borderRadius: '9999px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <List size={20} />
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 1rem'
      }}>
        <div style={{
          width: '80%',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '2rem',
          margin: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '100', marginBottom: '0.5rem', color: '#1f2937' }}>Focus on this task:</h2>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', padding: '2rem 0', color: '#111827' }}>
              {todo.text}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <button 
                id="complete-button"
                onClick={() => handleToggleComplete(todo.id)}
                style={{
                  backgroundColor: todo.completed ? '#10b981' : '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'background-color 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                  flexGrow: isFirstTask && isLastTask ? 1 : 'initial',
                  width: isFirstTask && isLastTask ? '100%' : 'auto',
                  marginRight: isFirstTask && isLastTask ? 0 : '0.5rem'
                }}
              >
                {todo.completed ? 'Completed!' : 'Mark Complete'}
                {todo.completed && <Check size={20} style={{ marginLeft: '0.5rem' }} />}
              </button>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                gap: '0.5rem',
                visibility: isFirstTask && isLastTask ? 'hidden' : 'visible' 
              }}>
                {!isFirstTask && (
                  <button 
                    onClick={handlePreviousTask}
                    style={{
                      backgroundColor: '#1f2937',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      transition: 'background-color 0.2s',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ transform: 'rotate(180deg)' }}
                    >
                      <path d="m8 3 9 9-9 9" />
                    </svg>
                  </button>
                )}
                
                {!isLastTask && (
                  <button 
                    onClick={handleNextTask}
                    style={{
                      backgroundColor: '#1f2937',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      transition: 'background-color 0.2s',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          color: '#4b5563',
          backgroundColor: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          Task {currentIncompleteIndex + 1} of {incompleteTasksIndices.length} incomplete
        </div>
      </div>
    </div>
  );
};
  
// List view - manage all tasks

const renderListView = () => {
  return (
    <div style={{
      margin: '0 auto',
      
      padding: '2rem 1rem',
      height: '100%',
      width: '80%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        height: '60vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Focus Pocus
          </h1>
          {todos.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem'
              }}
            >
              <X size={14} style={{ marginRight: '0.25rem' }} />
              Clear All
            </button>
          )}
        </div>
        
        {/* Confirmation dialog for clearing all tasks */}
        {showClearConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              maxWidth: '20rem',
              width: '90%'
            }}>
              <h3 style={{ marginTop: 0, color: '#111827' }}>Clear all tasks?</h3>
              <p style={{ color: '#4b5563' }}>This action cannot be undone. Are you sure you want to remove all tasks?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllTasks}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            placeholder="Add a new task..."
            style={{
              flexGrow: 1,
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem 0 0 0.5rem',
              outline: 'none',
              color: '#374151'
            }}
          />
          <button 
            onClick={handleAddTodo}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0 0.5rem 0.5rem 0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >
            <Plus size={20} />
          </button>
        </div>
        
        {todos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '2rem',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            No tasks yet. Add your first task above!
          </div>
        ) : (
          <div style={{
            overflowY: 'auto',
            flexGrow: 1,
            paddingRight: '0.5rem',
            marginRight: '-0.5rem'
          }}>
            <ul style={{ paddingLeft: 0, margin: 0 }}>
              {todos.map((todo) => (
                <li 
                  key={todo.id} 
                  style={{
                    backgroundColor: todo.completed ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${todo.completed ? '#bbf7d0' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {editingId === todo.id ? (
                    <div style={{ flexGrow: 1, display: 'flex' }}>
                      <input 
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        style={{
                          flexGrow: 1,
                          padding: '0.25rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          outline: 'none',
                          color: '#374151'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          marginLeft: '0.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleComplete(todo.id)}
                        style={{
                          backgroundColor: todo.completed ? '#10b981' : 'white',
                          border: `1px solid ${todo.completed ? '#10b981' : '#d1d5db'}`,
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.75rem',
                          flexShrink: 0,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          padding: 0,
                          color: 'white'
                        }}
                      >
                        {todo.completed && <Check size={14} />}
                      </button>
                      
                      <span style={{
                        flexGrow: 1,
                        color: todo.completed ? '#6b7280' : '#1f2937',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}>
                        {todo.text}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                        <button
                          onClick={() => handleEditTodo(todo.id)}
                          style={{
                            padding: '0.25rem',
                            color: '#6b7280',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          style={{
                            padding: '0.25rem',
                            color: '#6b7280',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {todos.length > 0 && (
        <button 
          onClick={() => setView('focus')}
          style={{
            width: '100%',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'background-color 0.2s',
            border: 'none',
            cursor: 'pointer',
            marginTop: 'auto'
          }}
        >
          <Target size={20} style={{ marginRight: '0.5rem' }} />
          Focus Mode
        </button>
      )}
    </div>
  );
};
  
  return (
    <div style={{ minHeight: '100vh', width: '100vw' }}>
      {isExploding && <Confetti 
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />}
      {view === 'list' ? renderListView() : renderFocusView()}
    </div>
  );
};

export default Main;