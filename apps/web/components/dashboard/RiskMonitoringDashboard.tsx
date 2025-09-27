"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    api: 'healthy' | 'degraded' | 'down';
    data: 'healthy' | 'degraded' | 'down';
    security: 'healthy' | 'degraded' | 'down';
    performance: 'healthy' | 'degraded' | 'down';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    riskScore: number;
  };
  alerts: Record<string, unknown>[];
}

interface RiskMetrics {
  overallRiskScore: number;
  riskCategory: 'low' | 'medium' | 'high' | 'critical';
  activeAlerts: number;
  criticalAlerts: number;
  systemHealth: {
    api: number;
    data: number;
    performance: number;
  };
  recommendations: string[];
}

export const RiskMonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemData = async () => {
    try {
      // Fetch system health and risk metrics
      const [healthResponse, riskResponse] = await Promise.all([
        fetch('/api/system/health'),
        fetch('/api/risk/metrics')
      ]);

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }

      if (riskResponse.ok) {
        const riskData = await riskResponse.json();
        setRiskMetrics(riskData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'critical': case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': case 'down': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600';
    if (score <= 50) return 'text-yellow-600';
    if (score <= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 25) return 'Low';
    if (score <= 50) return 'Medium';
    if (score <= 75) return 'High';
    return 'Critical';
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-xl text-zinc-900 flex items-center gap-2">
            <Shield className="text-zinc-400" />
            Risk Monitoring Dashboard
            {autoRefresh && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                <Activity className="h-3 w-3" />
                Live
              </div>
            )}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Real-time system health and risk monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </button>
          <button
            onClick={fetchSystemData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-zinc-900 mb-3">System Health</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl ${getHealthColor(systemHealth.overall)}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.overall)}
                <div>
                  <div className="text-xs font-medium">Overall</div>
                  <div className="text-sm font-semibold capitalize">{systemHealth.overall}</div>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${getHealthColor(systemHealth.components?.api || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.components?.api || 'healthy')}
                <div>
                  <div className="text-xs font-medium">API</div>
                  <div className="text-sm font-semibold capitalize">{systemHealth.components?.api || 'healthy'}</div>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${getHealthColor(systemHealth.components?.data || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.components?.data || 'healthy')}
                <div>
                  <div className="text-xs font-medium">Data</div>
                  <div className="text-sm font-semibold capitalize">{systemHealth.components?.data || 'healthy'}</div>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${getHealthColor(systemHealth.components?.security || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.components?.security || 'healthy')}
                <div>
                  <div className="text-xs font-medium">Security</div>
                  <div className="text-sm font-semibold capitalize">{systemHealth.components?.security || 'healthy'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Metrics */}
      {riskMetrics && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-zinc-900 mb-3">Risk Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-black/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-600">Overall Risk Score</div>
                <BarChart3 className="h-4 w-4 text-zinc-400" />
              </div>
              <div className={`text-2xl font-bold ${getRiskColor(riskMetrics.overallRiskScore || 0)}`}>
                {riskMetrics.overallRiskScore || 0}
                <span className="text-sm font-normal text-zinc-500">/100</span>
              </div>
              <div className={`text-xs font-medium ${getRiskColor(riskMetrics.overallRiskScore || 0)}`}>
                {getRiskLevel(riskMetrics.overallRiskScore || 0)} Risk
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-black/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-600">Active Alerts</div>
                <AlertTriangle className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-900">
                {riskMetrics.activeAlerts || 0}
              </div>
              <div className="text-xs text-zinc-600">
                {riskMetrics.criticalAlerts || 0} critical
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-black/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-600">System Reliability</div>
                <TrendingUp className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-900">
                {(((riskMetrics.systemHealth?.api || 0) + (riskMetrics.systemHealth?.data || 0) + (riskMetrics.systemHealth?.performance || 0)) / 3).toFixed(1)}%
              </div>
              <div className="text-xs text-zinc-600">
                Average health
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-black/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-600">AI Analysis</div>
                <Brain className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                Active
              </div>
              <div className="text-xs text-zinc-600">
                Enhanced risk analysis
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {riskMetrics?.recommendations && riskMetrics.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-zinc-900 mb-3 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Recommendations
          </h4>
          <div className="p-4 rounded-xl bg-amber-50">
            <ul className="space-y-2">
              {riskMetrics.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Recent Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900">Risk analysis completed</div>
                <div className="text-xs text-zinc-500">All systems operational</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          {riskMetrics?.criticalAlerts && riskMetrics.criticalAlerts > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-red-900">Critical risk alert</div>
                  <div className="text-xs text-red-700">Immediate attention required</div>
                </div>
              </div>
              <div className="text-xs text-red-600">
                Now
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-black/5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div>
            Last updated: {lastUpdate.toLocaleString()}
          </div>
          <div>
            Monitoring 5 risk categories • 99.9% uptime target
          </div>
        </div>
      </div>
    </motion.div>
  );
};