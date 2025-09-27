

import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const statusStyles: { [key in TaskStatus]: { bg: string, text: string } } = {
  [TaskStatus.PENDING]: { bg: 'bg-gray-200', text: 'text-gray-800' },
  [TaskStatus.IN_PROGRESS]: { bg: 'bg-blue-200', text: 'text-blue-800' },
  [TaskStatus.COMPLETED]: { bg: 'bg-green-200', text: 'text-green-800' },
};

const SubtaskForm: React.FC<{ taskId: string; onAddSubtask: (taskId: string, text: string) => void; onCancel: () => void;}> = ({ taskId, onAddSubtask, onCancel }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAddSubtask(taskId, text.trim());
            setText('');
            onCancel();
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Nova subtarefa..."
                className="flex-grow px-2 py-1 border border-[--color-border] rounded-md text-sm focus:ring-1 focus:ring-[--color-primary] bg-transparent"
                autoFocus
            />
            <button type="submit" className="bg-[--color-accent] text-white font-bold px-2 py-1 rounded-md text-sm hover:opacity-90">Salvar</button>
            <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-300">Cancelar</button>
        </form>
    );
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onUpdateStatus, onAddSubtask, onDeleteSubtask, onToggleSubtask }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = task.dueDate && new Date(task.dueDate + 'T00:00:00') < today && !isCompleted;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('taskQuadrant', task.quadrant);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const allSubtasksDone = totalSubtasks > 0 && completedSubtasks === totalSubtasks;

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-[--color-foreground] p-3 rounded-lg shadow-sm flex flex-col group transition-all duration-200 cursor-grab active:cursor-grabbing ${isCompleted ? 'opacity-60' : ''} ${isOverdue ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent'}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex-grow pr-2">
          <p className={`text-[--color-text-primary] break-words ${isCompleted ? 'line-through text-[--color-text-secondary]' : ''}`}>
            {task.text}
          </p>
        </div>
        <div className="flex items-center flex-shrink-0 gap-1">
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="text-[--color-text-secondary] hover:text-[--color-primary] focus:text-[--color-primary-hover] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Adicionar subtarefa a: ${task.text}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-[--color-text-secondary] hover:text-red-500 focus:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Excluir tarefa: ${task.text}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {totalSubtasks > 0 && (
          <div className="mt-3 text-xs text-[--color-text-secondary] flex items-center gap-2">
              <span className={`font-medium ${allSubtasksDone ? 'text-green-600' : ''}`}>
                  {completedSubtasks}/{totalSubtasks} concluídas
              </span>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${allSubtasksDone ? 'bg-green-500' : 'bg-[--color-primary]'}`} style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}></div>
              </div>
          </div>
      )}
      
      {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-[--color-border]">
              {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center justify-between group/subtask">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={subtask.completed} onChange={() => onToggleSubtask(task.id, subtask.id)} className="h-4 w-4 rounded border-gray-300 text-[--color-primary] focus:ring-[--color-primary]" />
                          <span className={`${subtask.completed ? 'line-through text-[--color-text-secondary]' : 'text-[--color-text-primary]'}`}>{subtask.text}</span>
                      </label>
                      <button onClick={() => onDeleteSubtask(task.id, subtask.id)} aria-label={`Excluir subtarefa: ${subtask.text}`} className="opacity-0 group-hover/subtask:opacity-100 text-red-500 hover:text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
                      </button>
                  </div>
              ))}
          </div>
      )}

      {isAddingSubtask && <SubtaskForm taskId={task.id} onAddSubtask={onAddSubtask} onCancel={() => setIsAddingSubtask(false)} />}

      <div className="mt-3 pt-2 border-t border-[--color-border] border-dashed flex items-center justify-between text-xs w-full">
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-[--color-text-secondary]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {task.dueDate ? (
            <span className={`${isOverdue ? 'text-red-600 font-bold' : 'text-[--color-text-secondary]'}`}>
              {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          ) : (
            <span className="text-[--color-text-secondary] italic">Sem data</span>
          )}
        </div>

        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs border rounded-md px-2 py-0.5 font-medium cursor-pointer transition-colors ${statusStyles[task.status].bg} ${statusStyles[task.status].text} border-transparent focus:ring-1 focus:ring-[--color-primary]`}
          aria-label={`Status da tarefa: ${task.text}`}
        >
          <option value={TaskStatus.PENDING}>Pendente</option>
          <option value={TaskStatus.IN_PROGRESS}>Em Andamento</option>
          <option value={TaskStatus.COMPLETED}>Concluída</option>
        </select>
      </div>
    </div>
  );
};

export default TaskItem;