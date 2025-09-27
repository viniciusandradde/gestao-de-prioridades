import React, { useState } from 'react';
import { QuadrantType } from '../types';

interface AddTaskFormProps {
  onAddTask: (text: string, quadrant: QuadrantType, dueDate?: string) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [quadrant, setQuadrant] = useState<QuadrantType>(QuadrantType.DO);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask(text.trim(), quadrant, dueDate);
      setText('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
      <div className="sm:col-span-2 md:col-span-2">
         <label htmlFor="task-text" className="sr-only">Descrição da Tarefa</label>
        <input
          id="task-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma nova tarefa..."
          className="w-full px-4 py-2 border border-[--color-border] rounded-lg focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary] transition bg-[--color-foreground] text-[--color-text-primary]"
          required
        />
      </div>
      <div>
        <label htmlFor="task-quadrant" className="sr-only">Quadrante</label>
        <select
            id="task-quadrant"
            value={quadrant}
            onChange={(e) => setQuadrant(e.target.value as QuadrantType)}
            className="w-full px-4 py-2 border border-[--color-border] rounded-lg focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary] transition bg-[--color-foreground] text-[--color-text-primary]"
        >
            <option value={QuadrantType.DO}>Urgente e Importante</option>
            <option value={QuadrantType.SCHEDULE}>Não Urgente e Importante</option>
            <option value={QuadrantType.DELEGATE}>Urgente e Não Importante</option>
            <option value={QuadrantType.ELIMINATE}>Não Urgente e Não Importante</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
            <label htmlFor="task-duedate" className="sr-only">Data de Vencimento</label>
            <input
                id="task-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-[--color-border] rounded-lg focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary] transition bg-[--color-foreground] text-[--color-text-primary] text-sm"
            />
        </div>
        <button
            type="submit"
            className="bg-[--color-accent] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity h-full"
            >
            Adicionar
        </button>
      </div>
    </form>
  );
};

export default AddTaskForm;