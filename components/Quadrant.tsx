

import React, { useState } from 'react';
import { Task, QuadrantType, TaskStatus } from '../types';
import TaskItem from './TaskItem';

interface QuadrantProps {
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onMoveTask: (id: string, quadrant: QuadrantType) => void;
  quadrantType: QuadrantType;
  onAddSubtask: (taskId: string, text: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const QuadrantIcon: React.FC<{ type: QuadrantType }> = ({ type }) => {
  const iconClass = "h-6 w-6 text-[--color-text-secondary]";
  switch (type) {
    case QuadrantType.DO:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.287 8.287 0 003-2.555A8.321 8.321 0 0112 6.75a8.321 8.321 0 012.286.445A8.287 8.287 0 0015 9.601a8.287 8.287 0 002.962-2.555 8.252 8.252 0 01-2.6-1.797z" />
        </svg>
      );
    case QuadrantType.SCHEDULE:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
        </svg>
      );
    case QuadrantType.DELEGATE:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case QuadrantType.ELIMINATE:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    default:
      return null;
  }
};


const Quadrant: React.FC<QuadrantProps> = (props) => {
  const { title, tasks, onDeleteTask, onUpdateTaskStatus, onMoveTask, quadrantType, onAddSubtask, onDeleteSubtask, onToggleSubtask } = props;
  const [isOver, setIsOver] = useState(false);
  const quadrantStyles = {
    [QuadrantType.DO]: {
      bg: 'bg-[--quadrant-do-bg]',
      border: 'border-[--quadrant-do-border]',
      text: 'text-[--quadrant-do-text]',
    },
    [QuadrantType.SCHEDULE]: {
      bg: 'bg-[--quadrant-schedule-bg]',
      border: 'border-[--quadrant-schedule-border]',
      text: 'text-[--quadrant-schedule-text]',
    },
    [QuadrantType.DELEGATE]: {
      bg: 'bg-[--quadrant-delegate-bg]',
      border: 'border-[--quadrant-delegate-border]',
      text: 'text-[--quadrant-delegate-text]',
    },
    [QuadrantType.ELIMINATE]: {
      bg: 'bg-[--quadrant-eliminate-bg]',
      border: 'border-[--quadrant-eliminate-border]',
      text: 'text-[--quadrant-eliminate-text]',
    },
  };

  const styles = quadrantStyles[quadrantType];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const taskOriginQuadrant = e.dataTransfer.getData('taskQuadrant');
    if (taskId && taskOriginQuadrant !== quadrantType) {
      onMoveTask(taskId, quadrantType);
    }
  };


  return (
    <div 
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border-t-4 p-4 shadow-md transition-all duration-200 hover:shadow-lg flex flex-col ${styles.bg} ${styles.border} ${isOver ? 'ring-2 ring-offset-2 ring-[--color-primary]' : ''}`}
    >
      <div className="mb-4 flex justify-between items-start">
        <h3 className={`text-xl font-bold ${styles.text}`}>{title}</h3>
        <QuadrantIcon type={quadrantType} />
      </div>
      <div className="space-y-2 min-h-[100px] flex-grow">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onUpdateStatus={onUpdateTaskStatus}
              onAddSubtask={onAddSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onToggleSubtask={onToggleSubtask}
            />
          ))
        ) : (
          <p className="text-[--color-text-secondary] text-sm italic pt-4 text-center">Nenhuma tarefa aqui ainda.</p>
        )}
      </div>
    </div>
  );
};

export default Quadrant;