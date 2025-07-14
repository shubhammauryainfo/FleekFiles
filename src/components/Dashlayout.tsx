import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  LayoutDashboard, 
  HardDrive, 
  Users, 
  FileText, 
  Menu, 
  X,
  Upload,
  Download,
  FolderOpen,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#' },
    { name: 'Available Storage', icon: HardDrive, href: '#' },
    { name: 'Users', icon: Users, href: '#' },
    { name: 'Login Logs', icon: FileText, href: '#' }
  ];

  const statsCards = [
    { title: 'Total Files', value: '2,847', icon: FolderOpen, change: '+12%', color: 'text-blue-600' },
    { title: 'Storage Used', value: '45.2 GB', icon: HardDrive, change: '+3%', color: 'text-green-600' },
    { title: 'Active Users', value: '127', icon: Users, change: '+8%', color: 'text-purple-600' },
    { title: 'Recent Uploads', value: '89', icon: Upload, change: '+24%', color: 'text-orange-600' }
  ];

  const recentFiles = [
    { name: 'Project_Report.pdf', size: '2.4 MB', uploaded: '2 hours ago', type: 'PDF' },
    { name: 'Design_Assets.zip', size: '15.8 MB', uploaded: '4 hours ago', type: 'ZIP' },
    { name: 'Meeting_Notes.docx', size: '1.2 MB', uploaded: '1 day ago', type: 'DOCX' },
    { name: 'Presentation.pptx', size: '8.7 MB', uploaded: '2 days ago', type: 'PPTX' },
    { name: 'Budget_Analysis.xlsx', size: '3.1 MB', uploaded: '3 days ago', type: 'XLSX' }
  ];

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Fleek Files</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="mt-6 px-3">
        {navigationItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveNav(item.name)}
            className={`w-full flex items-center px-3 py-3 mb-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeNav === item.name 
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );

  const TopBar = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{activeNav}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, change, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${color}`}>{change} from last month</p>
        </div>
        <div className={`p-3 rounded-xl ${color === 'text-blue-600' ? 'bg-blue-50' : color === 'text-green-600' ? 'bg-green-50' : color === 'text-purple-600' ? 'bg-purple-50' : 'bg-orange-50'}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  const RecentUploads = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All</button>
      </div>
      
      <div className="space-y-4">
        {recentFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FolderOpen size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{file.size} • {file.uploaded}</p>
              </div>
            </div>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{file.type}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const StorageUsage = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
        <Activity size={20} className="text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Used</span>
          <span className="text-sm font-medium text-gray-900">45.2 GB of 100 GB</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
              <Download size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Downloads</p>
            <p className="text-lg font-semibold text-gray-900">234</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2">
              <Upload size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Uploads</p>
            <p className="text-lg font-semibold text-gray-900">89</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((card, index) => (
                <StatsCard key={index} {...card} />
              ))}
            </div>
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentUploads />
              </div>
              <div className="lg:col-span-1">
                <StorageUsage />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;