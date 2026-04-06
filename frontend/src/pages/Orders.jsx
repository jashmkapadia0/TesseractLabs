import { useState, useEffect } from 'react'
import { FaSpinner, FaCheckCircle, FaClock, FaTimesCircle, FaChartBar } from 'react-icons/fa'
import { getOrders, getOrderStats } from '../api/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [filter])

  const loadOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const result = await getOrders(params)

      if (result.success) {
        setOrders(result.data)
      } else {
        setError('Failed to load orders')
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getOrderStats()
      if (result.success) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-accent-success" />
      case 'pending':
        return <FaClock className="text-accent-warning" />
      case 'failed':
        return <FaTimesCircle className="text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-accent-success/20 text-accent-success',
      pending: 'bg-accent-warning/20 text-accent-warning',
      failed: 'bg-red-500/20 text-red-500'
    }
    return badges[status] || 'bg-gray-500/20 text-gray-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Orders</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={<FaChartBar />}
          />
          <StatCard
            label="Completed"
            value={stats.completedOrders}
            icon={<FaCheckCircle />}
            color="text-accent-success"
          />
          <StatCard
            label="Pending"
            value={stats.pendingOrders}
            icon={<FaClock />}
            color="text-accent-warning"
          />
          <StatCard
            label="Failed"
            value={stats.failedOrders}
            icon={<FaTimesCircle />}
            color="text-red-500"
          />
          <StatCard
            label="Revenue"
            value={`₹${stats.totalRevenue.toFixed(0)}`}
            icon={<span>₹</span>}
            color="text-accent-primary"
          />
          <StatCard
            label="Material Used"
            value={`${stats.totalMaterialGrams.toFixed(0)}g`}
            icon={<span>⚖️</span>}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="All Orders"
          />
          <FilterButton
            active={filter === 'pending'}
            onClick={() => setFilter('pending')}
            label="Pending"
          />
          <FilterButton
            active={filter === 'completed'}
            onClick={() => setFilter('completed')}
            label="Completed"
          />
          <FilterButton
            active={filter === 'failed'}
            onClick={() => setFilter('failed')}
            label="Failed"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-accent-primary" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-500/10 border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color = 'text-gray-400' }) {
  return (
    <div className="card text-center">
      <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        active
          ? 'bg-accent-primary text-white'
          : 'bg-dark-tertiary text-gray-400 hover:bg-dark-border'
      }`}
    >
      {label}
    </button>
  )
}

function OrderCard({ order, getStatusIcon, getStatusBadge }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card hover:border-accent-primary transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold">{order.originalName}</h3>
            {getStatusIcon(order.payment_status)}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            <span>📦 Volume: {order.volume.toFixed(2)} mm³</span>
            <span>⚖️ Material: {order.grams.toFixed(2)}g</span>
            <span>🕐 Time: {order.machineTimeEstimate}h</span>
          </div>
          <p className="text-sm text-gray-400">
            {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Price & Status */}
        <div className="flex flex-col items-end space-y-2">
          <div className="text-3xl font-bold text-accent-primary">
            ₹{order.price.toFixed(2)}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.payment_status)}`}>
            {order.payment_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Dimensions */}
      {order.boundingBox && (
        <div className="mt-4 pt-4 border-t border-dark-border">
          <p className="text-sm text-gray-400 mb-2">Dimensions:</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">W:</span>{' '}
              <span className="font-semibold">{order.boundingBox.width.toFixed(1)}mm</span>
            </div>
            <div>
              <span className="text-gray-400">D:</span>{' '}
              <span className="font-semibold">{order.boundingBox.depth.toFixed(1)}mm</span>
            </div>
            <div>
              <span className="text-gray-400">H:</span>{' '}
              <span className="font-semibold">{order.boundingBox.height.toFixed(1)}mm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
