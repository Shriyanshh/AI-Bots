import React, { useState } from 'react';
import { FaPlay, FaPause } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";

const TasksPage = ({ taskTable, setTaskTable }) => {
  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch('http://localhost:3001/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      
      if (data.success) {
        deleteTask(id);
        alert(`Task ${id} deleted successfully.`);
      } else {
        alert('Task deletion failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting the task.');
    }
  };

  const handleStartClick = async (url, id) => {
    try {
      updateTaskStatus(id, "Running");
      const response = await fetch('http://localhost:3001/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, id }),
      });
      const data = await response.json();
      if (data.success) {
        deleteTask(id);
      } else {
        updateTaskStatus(id, "Pending"); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while starting the task.');
      updateTaskStatus(id, "Pending"); 
    }
  };

  const updateTaskStatus = (id, status) => {
    setTaskTable(taskTable.map(task => {
      if (task.id === id) {
        return { ...task, Status: status };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    const updatedTaskTable = taskTable.filter(task => task.id !== id);
    setTaskTable(updatedTaskTable);
  };

  
  const addTask = () => {
    const newRow = {
      id: Date.now(), // Using timestamp as ID
      URL: '',
      Status: 'Pending',
    };
    setTaskTable([...taskTable, newRow]);
  };

  const handleUrlChange = (id, value) => {
    setTaskTable(taskTable.map(task => {
      if (task.id === id) {
        return { ...task, URL: value };
      }
      return task;
    }));
  };

  return (
    <div className="flex flex-col h-3/4">
      <h1 className="text-4xl font-semibold">Tasks</h1>
      <div className="mt-10">
        <button className="px-4 py-2 bg-green-400 mr-3 rounded" onClick={addTask}>Create Task</button>
      </div>

      {taskTable.length > 0 ? (
        <table className="table-auto mt-3 w-full rounded-lg bg-blue-100" >
          <thead>
            <tr className="bg-blue-300">
              <th className="pl-5 text-left" style={{ borderTopLeftRadius: '10px' }}>Task ID</th>
              <th className="text-left w-1/3 ">URL</th>
              <th className="text-left w-1/6 ">Status</th>
              <th className="text-left" style={{ borderTopRightRadius: '10px' }}>Actions</th>

            </tr>
          </thead>

          <tbody>
            {taskTable.map(row => (
              <tr key={row.id} className="border-b border-blue-400 w-full">
                <td className="pl-5 text-left w-1/5">{row.id}</td>
                <td className="text-left">
                  <input
                    type="text"
                    onChange={(e) => handleUrlChange(row.id, e.target.value)}
                    className="bg-transparent border-b border-black px-2 py-1 w-[90%]"
                    value={row.URL}
                  />
                </td>
                <td className="text-left">{row.Status}</td>
                <td>
                  <div className="flex my-2">
                    <button className="bg-play-green mr-4 px-4 py-2 rounded" onClick={() => handleStartClick(row.URL, row.id)}>
                      <FaPlay />
                    </button>
                    <button className="bg-delete-red px-4 py-2 rounded" onClick={() => handleDeleteClick(row.id)}>
                      <FaRegTrashCan />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-5 text-2xl">No tasks available</p>
      )}
    </div>
  );
};

export default TasksPage;
