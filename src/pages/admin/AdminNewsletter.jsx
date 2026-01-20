import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total_subscribers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscribersData, statsData] = await Promise.all([
        adminAPI.getNewsletterSubscribers(),
        adminAPI.getNewsletterStats()
      ]);
      
      setSubscribers(subscribersData);
      setStats(statsData);
      setError('');
    } catch (err) {
      setError('Failed to load newsletter data');
      console.error('Error loading newsletter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId, email) => {
    if (!confirm(`Are you sure you want to delete subscriber: ${email}?`)) {
      return;
    }

    try {
      setDeleteLoading(subscriberId);
      await adminAPI.deleteNewsletterSubscriber(subscriberId);
      
      // Remove from local state
      setSubscribers(prev => prev.filter(sub => sub.id !== subscriberId));
      setStats(prev => ({ ...prev, total_subscribers: prev.total_subscribers - 1 }));
      
    } catch (err) {
      setError('Failed to delete subscriber');
      console.error('Error deleting subscriber:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleStatus = async (subscriberId, currentStatus) => {
    try {
      setToggleLoading(subscriberId);
      const result = await adminAPI.toggleNewsletterSubscriberStatus(subscriberId);
      
      // Update local state
      setSubscribers(prev => prev.map(sub => 
        sub.id === subscriberId 
          ? { ...sub, is_active: result.new_status }
          : sub
      ));
      
      // Update stats if status changed from/to active
      if (currentStatus && !result.new_status) {
        // Changed from active to inactive
        setStats(prev => ({ ...prev, total_subscribers: prev.total_subscribers - 1 }));
      } else if (!currentStatus && result.new_status) {
        // Changed from inactive to active
        setStats(prev => ({ ...prev, total_subscribers: prev.total_subscribers + 1 }));
      }
      
    } catch (err) {
      setError('Failed to toggle subscriber status');
      console.error('Error toggling subscriber status:', err);
    } finally {
      setToggleLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600">Manage newsletter subscriptions</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Active Subscribers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_subscribers}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Subscribers</h3>
        </div>
        
        {subscribers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscribers</h3>
            <p className="mt-1 text-sm text-gray-500">No one has subscribed to the newsletter yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(subscriber.subscribed_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(subscriber.id, subscriber.is_active)}
                        disabled={toggleLoading === subscriber.id}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          subscriber.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } ${toggleLoading === subscriber.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {toggleLoading === subscriber.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                        ) : null}
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(subscriber.id, subscriber.is_active)}
                        disabled={toggleLoading === subscriber.id}
                        className={`text-sm px-2 py-1 rounded transition-colors ${
                          subscriber.is_active 
                            ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {toggleLoading === subscriber.id ? 'Loading...' : (subscriber.is_active ? 'Deactivate' : 'Activate')}
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                        disabled={deleteLoading === subscriber.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        {deleteLoading === subscriber.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNewsletter;