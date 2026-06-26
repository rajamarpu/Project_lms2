import React, { useMemo } from 'react';
import { MdPeople, MdSchool, MdLibraryBooks, MdAttachMoney } from 'react-icons/md';
import { MetricCard } from '../../ui/EnterpriseUI';
import { kpiMetrics } from './dashboardData';
import { useDateRange } from '../../../context/DateRangeContext';
import { scaleKpiMetrics } from '../../../utils/dashboardDateFilter';

const ICONS = {
  students: MdPeople,
  teachers: MdSchool,
  courses: MdLibraryBooks,
  revenue: MdAttachMoney,
};

const TONES = ['blue', 'green', 'purple', 'orange'];

const DashboardKpiRow = () => {
  const { startDate, endDate, label } = useDateRange();
  const metrics = useMemo(() => scaleKpiMetrics(kpiMetrics, startDate, endDate), [startDate, endDate]);

  return (
    <>
      <p className="sr-only">Metrics for {label}</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((card, index) => {
          const Icon = ICONS[card.iconKey];
          return (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              badge={card.trend}
              icon={Icon}
              tone={TONES[index % TONES.length]}
              delay={index * 0.08}
            />
          );
        })}
      </div>
    </>
  );
};

export default DashboardKpiRow;
