import React, { useState } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TaskFollowUp = () => {
  const { tasks, toggleTask, addTask, activeUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('QuoteFollowUp');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState('Normal');

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    addTask({
      title: taskTitle,
      task_category: taskCategory,
      due_date: `${dueDate}T18:00:00Z`,
      priority: taskPriority,
    });
    setTaskTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cross-Cutting: Tasks, Follow-Up Tracker & Escalations</h1>
          <p className="page-subtitle">
            Keep track of customer quotation follow-ups, pre-flight design reviews, supplier material chasing, and payment collections.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={16} /> Create Action Task
        </button>
      </div>

      <div className="tasks-two-col-layout">
        {/* Pending Tasks */}
        <div className="card flex-1">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Clock size={18} className="text-warning" /> Pending Action Tasks ({pendingTasks.length})
            </h3>
            <span className="badge badge-warning">Action Items</span>
          </div>

          <div className="tasks-list-wrapper">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-muted">All action tasks completed! Good job.</div>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className={`task-card-item ${task.priority === 'Escalated' ? 'task-escalated' : ''}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{task.title}</span>
                        <span className={`badge ${task.priority === 'Escalated' ? 'badge-danger' : (task.priority === 'High' ? 'badge-warning' : 'badge-secondary')}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xxs text-muted mt-1">
                        <span>Category: <strong>{task.task_category}</strong></span>
                        <span>Assignee: <strong>{task.assigned_to_name}</strong></span>
                        <span className="text-primary flex items-center gap-0.5">
                          <Calendar size={11} /> Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks History */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" /> Completed Tasks ({completedTasks.length})
            </h3>
          </div>

          <div className="tasks-list-wrapper">
            {completedTasks.map(task => (
              <div key={task.id} className="task-card-item opacity-60">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox mt-1"
                  />
                  <div>
                    <span className="line-through text-xs text-slate-600">{task.title}</span>
                    <div className="text-xxs text-muted">{task.assigned_to_name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-container max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Action Task / Follow-Up</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTaskSubmit} className="p-4">
              <div className="form-group">
                <label>Task Description / Title:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Call customer for Quote 143 approval..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    className="form-control"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                  >
                    <option value="QuoteFollowUp">Quote Follow-Up</option>
                    <option value="DesignReview">Design Proof Review</option>
                    <option value="PurchaseFollowUp">Purchase / Material Chase</option>
                    <option value="PaymentChase">Overdue Payment Chase</option>
                    <option value="QualityIssue">Quality Issue Action</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select
                    className="form-control"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Escalated">Escalated / Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date:</label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-footer mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Action Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
