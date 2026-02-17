/**
 * AdminHires Page
 * PRD-058: Listagem de contratacoes com KPIs e filtros
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Timer,
  FileText,
  Brain,
  Building2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function AdminHires() {
  const { hires } = useAdminJobs();
  const [companyFilter, setCompanyFilter] = useState<string>('');

  // Unique companies
  const companies = useMemo(
    () => [...new Set(hires.map((h) => h.companyName))].sort(),
    [hires]
  );

  // Filtered hires
  const filtered = useMemo(() => {
    if (!companyFilter || companyFilter === '__all__') return hires;
    return hires.filter((h) => h.companyName === companyFilter);
  }, [hires, companyFilter]);

  // KPIs
  const totalHires = hires.length;
  const avgTimeToFill = useMemo(() => {
    if (hires.length === 0) return 0;
    return Math.round(hires.reduce((s, h) => s + h.timeToFillDays, 0) / hires.length);
  }, [hires]);
  const withCV = hires.filter((h) => h.hasCV).length;
  const withTest = hires.filter((h) => h.hasTestResult).length;

  const kpis = [
    { label: 'Total Contratacoes', value: totalHires.toString(), icon: UserCheck, color: 'text-cyan-600', bgColor: 'bg-cyan-500/10' },
    { label: 'Tempo Medio Preenchimento', value: `${avgTimeToFill} dias`, icon: Timer, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    { label: 'Com Curriculo', value: withCV.toString(), icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { label: 'Com Teste', value: withTest.toString(), icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Contratações</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Registro de todas as contratações realizadas pela plataforma. Acompanhe métricas e tempo de preenchimento.
              </p>
            </div>
          </div>
        </motion.div>

        <AdminTabNav />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', kpi.bgColor)}>
                <kpi.icon className={cn('w-5 h-5', kpi.color)} />
              </div>
              <p className={cn('text-xl font-bold', kpi.color)}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as empresas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {companyFilter && companyFilter !== '__all__' && (
            <Button variant="ghost" size="sm" onClick={() => setCompanyFilter('')}>
              Limpar filtro
            </Button>
          )}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-soft overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Dias</TableHead>
                  <TableHead className="text-center">CV</TableHead>
                  <TableHead className="text-center">Teste</TableHead>
                  <TableHead className="hidden xl:table-cell">Perfil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhuma contratacao encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((hire) => (
                    <TableRow key={hire.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={hire.candidateAvatar} />
                            <AvatarFallback className="text-[10px]">
                              {hire.candidateName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{hire.candidateName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate">
                        {hire.jobTitle}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={hire.companyLogo} />
                            <AvatarFallback className="text-[8px]">
                              {hire.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{hire.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(hire.hireDate)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center text-sm font-medium">
                        {hire.timeToFillDays}
                      </TableCell>
                      <TableCell className="text-center">
                        {hire.hasCV ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Nao</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {hire.hasTestResult ? (
                          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 text-[10px]">
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Nao</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {hire.testProfile || '--'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
