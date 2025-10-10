"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Trash2 } from "lucide-react"
import { logger } from "@/lib/logger"

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [filter, setFilter] = useState<string>("ALL")

  const refreshLogs = () => {
    setLogs(logger.getLogs())
    setSummary(logger.getLogsSummary())
  }

  const clearLogs = () => {
    logger.clearLogs()
    refreshLogs()
  }

  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `trust-sharing-logs-${new Date().toISOString()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const filteredLogs = logs.filter((log) => filter === "ALL" || log.level === filter || log.step.includes(filter))

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800"
      case "WARN":
        return "bg-yellow-100 text-yellow-800"
      case "INFO":
        return "bg-blue-100 text-blue-800"
      case "DEBUG":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    refreshLogs()
    const interval = setInterval(refreshLogs, 2000) // Auto-refresh every 2 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Save Preferences Workflow Logs</h1>
        <p className="text-gray-600">Monitor the complete execution flow of the save preferences process</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.byLevel?.ERROR || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.byLevel?.WARN || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.byLevel?.INFO || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {["ALL", "ERROR", "WARN", "INFO", "DEBUG", "STEP_3", "STEP_4"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption)}
            >
              {filterOption}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium">Timestamp</th>
                  <th className="text-left p-3 font-medium">Level</th>
                  <th className="text-left p-3 font-medium">Step</th>
                  <th className="text-left p-3 font-medium">Substep</th>
                  <th className="text-left p-3 font-medium">User ID</th>
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-left p-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <Badge className={getLevelColor(log.level)}>{log.level}</Badge>
                    </td>
                    <td className="p-3 font-medium">{log.step}</td>
                    <td className="p-3 text-gray-600">{log.substep || "-"}</td>
                    <td className="p-3 font-mono text-xs">{log.userId || "-"}</td>
                    <td className="p-3">{log.duration ? `${log.duration}ms` : "-"}</td>
                    <td className="p-3 max-w-xs">
                      {log.data && (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">View Data</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{log.data}</pre>
                        </details>
                      )}
                      {log.error && <div className="text-red-600 text-xs">Error: {log.error}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
