import React from 'react';
import RecentOrders from './RecentOrders';
import TransactionGraph from './TransactionGraph';

const DashboardPage = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="text-4xl font-semibold mb-5">Dashboard</h1>
      <div>
        <TransactionGraph/>
        <RecentOrders/>
      </div>
    </div>
  )
}

export default DashboardPage;