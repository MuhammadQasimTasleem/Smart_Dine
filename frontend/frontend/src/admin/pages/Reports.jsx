import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiShoppingBag,
  FiPieChart,
} from "react-icons/fi";
import StatsCard from "../components/StatsCard";
import { getSalesReport, getPopularItems } from "../services/adminService";
import "../styles/admin.css";

const Reports = () => {
  const [salesData, setSalesData] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchReportData();
  }, [days]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [sales, popular] = await Promise.all([
        getSalesReport(days),
        getPopularItems(10),
      ]);
      setSalesData(sales);
      setPopularItems(popular);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!salesData?.daily_revenue) return { revenue: 0, orders: 0 };
    return salesData.daily_revenue.reduce(
      (acc, day) => ({
        revenue: acc.revenue + day.revenue,
        orders: acc.orders + day.orders,
      }),
      { revenue: 0, orders: 0 }
    );
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>View sales reports and analytics</p>
        </div>
        <div className="filter-group">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatsCard
          title={`Revenue (${days} days)`}
          value={`₹${totals.revenue.toFixed(2)}`}
          icon={<FiDollarSign />}
          color="success"
        />
        <StatsCard
          title={`Orders (${days} days)`}
          value={totals.orders}
          icon={<FiShoppingBag />}
          color="primary"
        />
        <StatsCard
          title="Avg Order Value"
          value={`₹${totals.orders > 0 ? (totals.revenue / totals.orders).toFixed(2) : "0.00"}`}
          icon={<FiTrendingUp />}
          color="info"
        />
        <StatsCard
          title="Top Items"
          value={popularItems.length}
          icon={<FiPieChart />}
          color="warning"
        />
      </div>

      <div className="reports-grid">
        {/* Daily Revenue Chart (Simple Table View) */}
        <div className="report-section">
          <h2>Daily Revenue</h2>
          <div className="revenue-chart">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.daily_revenue
                  ?.slice(-10)
                  .reverse()
                  .map((day, index) => (
                    <tr key={index}>
                      <td>{new Date(day.date).toLocaleDateString()}</td>
                      <td>{day.orders}</td>
                      <td>₹{day.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Items */}
        <div className="report-section">
          <h2>Top Selling Items</h2>
          <div className="popular-items-list">
            {popularItems.length === 0 ? (
              <p className="no-data">No sales data available</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {popularItems.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.item_name}</td>
                      <td>{item.total_quantity}</td>
                      <td>₹{parseFloat(item.total_revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Types Distribution */}
        <div className="report-section">
          <h2>Order Types</h2>
          <div className="order-types-chart">
            {salesData?.order_types?.length === 0 ? (
              <p className="no-data">No order data available</p>
            ) : (
              <div className="order-types-list">
                {salesData?.order_types?.map((type, index) => (
                  <div key={index} className="order-type-item">
                    <div className="order-type-info">
                      <span className="order-type-name">
                        {type.order_type.replace("_", " ")}
                      </span>
                      <span className="order-type-count">
                        {type.count} orders
                      </span>
                    </div>
                    <div className="order-type-bar">
                      <div
                        className="order-type-bar-fill"
                        style={{
                          width: `${
                            (type.count /
                              salesData.order_types.reduce(
                                (sum, t) => sum + t.count,
                                0
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="order-type-revenue">
                      ₹{parseFloat(type.revenue || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
