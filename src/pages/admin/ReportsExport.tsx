/**
 * ReportsExport page
 * PRD-059: Relatorios "Radar" - Export & Scheduling
 *
 * Export PDF/Excel reports and manage automated report schedules.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CalendarClock,
  Loader2,
  Mail,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScheduleEditor } from '@/components/admin/reports/ScheduleEditor';
import { useReportExport } from '@/hooks/useReportExport';
import { useReportsData } from '@/hooks/useReportsData';
import { formatDateBR } from '@/lib/formatters';
import type { ReportSchedule } from '@/types';

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export default function ReportsExport() {
  const {
    schedules,
    isExporting,
    exportPDF,
    exportExcel,
    addSchedule,
    updateSchedule,
    removeSchedule,
    toggleSchedule,
  } = useReportExport();

  const { financialKPIs, growthKPIs, operationalKPIs } = useReportsData();

  const [pdfPeriod, setPdfPeriod] = useState('30d');
  const [excelPeriod, setExcelPeriod] = useState('30d');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | undefined>();

  const handleExportPDF = () => {
    exportPDF({
      type: 'pdf',
      period: pdfPeriod,
      financialKPIs,
      growthKPIs,
      operationalKPIs,
    });
  };

  const handleExportExcel = () => {
    exportExcel({
      type: 'excel',
      period: excelPeriod,
      financialKPIs,
      growthKPIs,
      operationalKPIs,
    });
  };

  const handleEditSchedule = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setEditorOpen(true);
  };

  const handleNewSchedule = () => {
    setEditingSchedule(undefined);
    setEditorOpen(true);
  };

  const handleSaveSchedule = (data: Omit<ReportSchedule, 'id'>) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, data);
    } else {
      addSchedule(data);
    }
  };

  const getFrequencyLabel = (schedule: ReportSchedule): string => {
    if (schedule.frequency === 'weekly') {
      const day = WEEKDAY_NAMES[schedule.dayOfWeek ?? 1];
      return `Semanal - ${day} as ${String(schedule.hour).padStart(2, '0')}:00`;
    }
    return `Mensal - Dia ${schedule.dayOfMonth ?? 1} as ${String(schedule.hour).padStart(2, '0')}:00`;
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exportar Relatorios</h1>
          <p className="text-muted-foreground">Exporte relatorios e configure envios automaticos</p>
        </div>

        <AdminTabNav />

        {/* Export Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PDF Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">PDF Executivo</CardTitle>
                    <CardDescription>
                      Relatorio consolidado com KPIs, graficos e insights para apresentacoes executivas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">Periodo:</span>
                  <Select value={pdfPeriod} onValueChange={setPdfPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Ultimos 7 dias</SelectItem>
                      <SelectItem value="30d">Ultimos 30 dias</SelectItem>
                      <SelectItem value="quarter">Trimestre</SelectItem>
                      <SelectItem value="year">Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Excel Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Excel Detalhado</CardTitle>
                    <CardDescription>
                      Planilha com 5 abas: Financeiro, Crescimento, Operacional, Assinaturas, Atividade
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">Periodo:</span>
                  <Select value={excelPeriod} onValueChange={setExcelPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Ultimos 7 dias</SelectItem>
                      <SelectItem value="30d">Ultimos 30 dias</SelectItem>
                      <SelectItem value="quarter">Trimestre</SelectItem>
                      <SelectItem value="year">Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Excel...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Schedules Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Agendamentos</CardTitle>
                    <CardDescription>Envio automatico de relatorios por e-mail</CardDescription>
                  </div>
                </div>
                <Button onClick={handleNewSchedule} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Agendamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento configurado
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      {/* Toggle */}
                      <Switch
                        checked={schedule.isActive}
                        onCheckedChange={() => toggleSchedule(schedule.id)}
                      />

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {schedule.type === 'pdf' ? (
                          <FileText className="w-4 h-4 text-red-500" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 text-green-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-foreground text-sm">
                            {schedule.name}
                          </span>
                          <Badge
                            variant={schedule.isActive ? 'default' : 'secondary'}
                            className="text-[10px] h-5"
                          >
                            {schedule.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getFrequencyLabel(schedule)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {schedule.recipients.length} destinatario{schedule.recipients.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {schedule.lastSentAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Ultimo envio: {formatDateBR(schedule.lastSentAt)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeSchedule(schedule.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Schedule Editor Dialog */}
      <ScheduleEditor
        schedule={editingSchedule}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveSchedule}
      />
    </DashboardLayout>
  );
}
