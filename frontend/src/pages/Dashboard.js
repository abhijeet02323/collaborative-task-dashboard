import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { taskService } from '../services/api';
import { Alert, LoadingSpinner, EmptyState } from '../components/shared';
import styles from '../styles/dashboard.module.css';

export const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks();
      setTasks(response.data.data);
    } catch (error) {
      setAlertType('error');
      setAlertMessage(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await taskService.updateTask(editingId, formData);
        setAlertMessage('Task updated successfully');
      } else {
        await taskService.createTask(
          formData.title,
          formData.description,
          formData.priority,
          formData.dueDate
        );
        setAlertMessage('Task created successfully');
      }
      setAlertType('success');
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      setEditingId(null);
      setShowForm(false);
      await fetchTasks();
    } catch (error) {
      setAlertType('error');
      setAlertMessage(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(id);
      setAlertMessage('Task deleted successfully');
      setAlertType('success');
      await fetchTasks();
    } catch (error) {
      setAlertType('error');
      setAlertMessage(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const handleStatusChange = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await taskService.updateTask(task.id, { status: newStatus });
      await fetchTasks();
    } catch (error) {
      setAlertType('error');
      setAlertMessage('Failed to update task status');
    }
  };

  if (loading && !tasks.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <div>
          <h1>Welcome, {user?.firstName}! 👋</h1>
          <p>Manage your tasks and stay productive</p>
        </div>
        <button onClick={logout} className={styles['btn-logout']}>
          Logout
        </button>
      </header>

      <Alert 
        type={alertType} 
        message={alertMessage} 
        onClose={() => setAlertMessage(null)} 
      />

      <main className={styles['dashboard-content']}>
        <section className={styles['tasks-section']}>
          <div className={styles['section-header']}>
            <h2>My Tasks</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className={styles['btn-primary']}
              >
                + New Task
              </button>
            )}
          </div>

          {showForm && (
            <div className={styles['task-form-container']}>
              <form onSubmit={handleSubmit} className={styles['task-form']}>
                <h3>{editingId ? 'Edit Task' : 'Create New Task'}</h3>

                <div className={styles['form-group']}>
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Task title"
                  />
                </div>

                <div className={styles['form-group']}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Task description (min 10 characters)"
                    rows="4"
                  />
                </div>

                <div className={styles['form-row']}>
                  <div className={styles['form-group']}>
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className={styles['form-group']}>
                    <label htmlFor="dueDate">Due Date</label>
                    <input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles['form-actions']}>
                  <button type="submit" className={styles['btn-success']}>
                    {editingId ? 'Update Task' : 'Create Task'}
                  </button>
                  <button type="button" onClick={handleCancel} className={styles['btn-secondary']}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {tasks.length === 0 ? (
            <EmptyState message="No tasks yet. Create your first task!" />
          ) : (
            <div className={styles['tasks-list']}>
              {tasks.map((task) => (
                <div key={task.id} className={`${styles['task-card']} ${styles[`priority-${task.priority}`]}`}>
                  <div className={styles['task-header']}>
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleStatusChange(task)}
                      className={styles['task-checkbox']}
                    />
                    <h3 className={task.status === 'completed' ? styles['completed'] : ''}>
                      {task.title}
                    </h3>
                    <span className={styles['priority-badge']}>{task.priority}</span>
                  </div>

                  <p className={styles['task-description']}>{task.description}</p>

                  <div className={styles['task-meta']}>
                    <span className={styles['task-status']}>
                      Status: <strong>{task.status}</strong>
                    </span>
                    {task.due_date && (
                      <span className={styles['task-date']}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className={styles['task-actions']}>
                    <button
                      onClick={() => handleEdit(task)}
                      className={styles['btn-edit']}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className={styles['btn-delete']}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
