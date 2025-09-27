import React from "react";
import { AlertTriangle, Info, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorNotificationProps {
  type:
    | "defillama-chart"
    | "general"
    | "warning";
  title: string;
  message: string;
  onRetry?: () => void;
  actionUrl?: string;
  actionText?: string;
}

const errorConfig = {
  "defillama-chart": {
    color: "border-yellow-200 bg-yellow-50",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-600",
    description: "Chart data from DeFiLlama is currently unavailable",
  },
  general: {
    color: "border-red-200 bg-red-50",
    textColor: "text-red-800",
    iconColor: "text-red-600",
    description: "An unexpected error occurred",
  },
  warning: {
    color: "border-blue-200 bg-blue-50",
    textColor: "text-blue-800",
    iconColor: "text-blue-600",
    description: "Important information about this opportunity",
  },
};

export function ErrorNotification({
  type,
  title,
  message,
  onRetry,
  actionUrl,
  actionText = "Learn More",
}: ErrorNotificationProps) {
  const config = errorConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${config.color} p-4`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {type === "warning" ? (
            <Info className={`h-5 w-5 ${config.iconColor}`} />
          ) : (
            <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${config.textColor}`}>{title}</h3>
          <p className={`text-sm ${config.textColor} opacity-90 mt-1`}>
            {message}
          </p>
          <p className={`text-xs ${config.textColor} opacity-75 mt-1`}>
            {config.description}
          </p>

          <div className="mt-3 flex items-center space-x-3">
            {onRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${config.textColor} bg-current bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </motion.button>
            )}

            {actionUrl && (
              <a
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${config.textColor} bg-current bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {actionText}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


export function ChartDataError({
  protocol = "Data Provider",
  onRetry,
}: {
  protocol?: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorNotification
      type="defillama-chart"
      title={`${protocol} Chart Data Unavailable`}
      message="Historical chart data is temporarily unavailable. This may be due to API rate limits or service maintenance."
      onRetry={onRetry}
      actionUrl="https://defillama.com"
      actionText="Check DeFiLlama"
    />
  );
}

export function DataLoadingError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorNotification
      type="general"
      title="Data Loading Error"
      message={message}
      onRetry={onRetry}
    />
  );
}

export function NoChartDataAvailable() {
  return (
    <ErrorNotification
      type="warning"
      title="No Chart Data Available"
      message="Historical performance data is not available for this opportunity."
      actionUrl="https://defillama.com"
      actionText="Explore DeFiLlama"
    />
  );
}
