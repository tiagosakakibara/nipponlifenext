"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { DailyActivity } from '../hooks/useAdminDashboard';

interface DashboardChartsProps {
    data: DailyActivity[];
}

export function ActivityChart({ data }: DashboardChartsProps) {
    const t = useTranslations();
    const { theme } = useTheme();

    const isDark = theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : '#9CA3AF';
    const tooltipBg = isDark ? '#1a1a2e' : '#fff'; // Using nippon-dark color or variable approximation
    const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
    const tooltipText = isDark ? '#fff' : '#000';
    const cursorFill = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6';

    return (
        <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-sm border border-app min-h-[300px] sm:min-h-[450px]">
            <h3 className="text-lg font-bold text-primary mb-6 font-heading">{t('admin.activity14Days')}</h3>
            <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 10,
                            left: -15,
                            bottom: 40,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                            stroke={textColor}
                            fontSize={12}
                            tick={{ fill: textColor }}
                        />
                        <YAxis stroke={textColor} fontSize={11} allowDecimals={false} tick={{ fill: textColor }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                borderColor: tooltipBorder,
                                color: tooltipText,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: tooltipText }}
                            cursor={{ fill: cursorFill }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconSize={12}
                            wrapperStyle={{
                                paddingTop: '10px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: textColor
                            }}
                        />
                        <Bar name={t('admin.posts_chart')} dataKey="posts" fill="#2563EB" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar name={t('admin.jobs_chart')} dataKey="jobs" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar name={t('admin.community_chart')} dataKey="community" fill="#EC4899" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
